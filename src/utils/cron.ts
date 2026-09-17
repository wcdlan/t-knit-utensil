// Cron 表达式工具：解析 / 校验 / 中文描述 / 执行时间预览 / 字段构建
//
// 支持范围：
// - 5 段标准式：分 时 日 月 周
// - 6 段带秒式：秒 分 时 日 月 周
// - 7 段带年式：秒 分 时 日 月 周 年
// - 别名：@yearly / @annually / @monthly / @weekly / @daily / @midnight / @hourly / @reboot / @every 30m
// - 语法：*、?、列表（,）、范围（-）、步长（/）、最后一天（L）、最近工作日（W）、第 n 个星期几（#）

import type {
	CronBuilderContext,
	CronBuilderField,
	CronFieldDetail,
	CronFieldKind,
	CronFieldType,
	CronParseResult,
	CronPlaceholder,
	CronPreviewResult,
	CronRunItem,
	CronSyntaxKind
} from '@/types/cron';

// ------------------------------------------------------------------
// 字段元数据
// ------------------------------------------------------------------

export const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/** 星期名称：下标 0 与 7 同为周日（cron 中两者等价） */
export const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/** 星期英文缩写 → 数值 */
const WEEKDAY_ALIAS: Record<string, number> = {
	sun: 0,
	sunday: 0,
	mon: 1,
	monday: 1,
	tue: 2,
	tues: 2,
	tuesday: 2,
	wed: 3,
	wednesday: 3,
	thu: 4,
	thur: 4,
	thurs: 4,
	thursday: 4,
	fri: 5,
	friday: 5,
	sat: 6,
	saturday: 6
};

/** 月份英文缩写 → 数值 */
const MONTH_ALIAS: Record<string, number> = {
	jan: 1,
	january: 1,
	feb: 2,
	february: 2,
	mar: 3,
	march: 3,
	apr: 4,
	april: 4,
	may: 5,
	jun: 6,
	june: 6,
	jul: 7,
	july: 7,
	aug: 8,
	august: 8,
	sep: 9,
	sept: 9,
	september: 9,
	oct: 10,
	october: 10,
	nov: 11,
	november: 11,
	dec: 12,
	december: 12
};

/** 字段静态元数据 */
interface FieldSpec {
	label: string;
	min: number;
	max: number;
	names?: string[];
	alias?: Record<string, number>;
	rangeHint: string;
}

const FIELD_SPEC: Record<CronFieldType, FieldSpec> = {
	second: { label: '秒', min: 0, max: 59, rangeHint: '0-59' },
	minute: { label: '分钟', min: 0, max: 59, rangeHint: '0-59' },
	hour: { label: '小时', min: 0, max: 23, rangeHint: '0-23' },
	day: { label: '日期', min: 1, max: 31, rangeHint: '1-31，支持 L / W' },
	month: { label: '月份', min: 1, max: 12, names: MONTH_NAMES, alias: MONTH_ALIAS, rangeHint: '1-12 或 JAN-DEC' },
	week: {
		label: '星期',
		min: 0,
		max: 7,
		names: WEEKDAY_NAMES,
		alias: WEEKDAY_ALIAS,
		rangeHint: '0-7（0 与 7 均为周日）或 SUN-SAT'
	},
	year: { label: '年份', min: 1970, max: 2199, rangeHint: '1970-2199' }
};

/** 带秒表达式（6 段）的字段顺序 */
const SECOND_TYPES: CronFieldType[] = ['second', 'minute', 'hour', 'day', 'month', 'week'];

/** 不带秒表达式（5 段）的字段顺序 */
const STANDARD_TYPES: CronFieldType[] = ['minute', 'hour', 'day', 'month', 'week'];

/** 支持的别名及其展开结果 */
const ALIAS_MAP: Record<string, { expression: string; description: string }> = {
	'@yearly': { expression: '0 0 1 1 *', description: '每年 1 月 1 日 00:00 执行' },
	'@annually': { expression: '0 0 1 1 *', description: '每年 1 月 1 日 00:00 执行' },
	'@monthly': { expression: '0 0 1 * *', description: '每月 1 日 00:00 执行' },
	'@weekly': { expression: '0 0 * * 0', description: '每周日 00:00 执行' },
	'@daily': { expression: '0 0 * * *', description: '每天 00:00 执行' },
	'@midnight': { expression: '0 0 * * *', description: '每天 00:00 执行' },
	'@hourly': { expression: '0 * * * *', description: '每小时整点执行' },
	'@reboot': { expression: '', description: '系统启动时执行一次（仅 crond 支持，无固定时间点）' }
};

/** 别名模式下不参与时间预览的别名 */
const NON_TIME_ALIAS = '@reboot';

/** 单个字段的解析结果 */
interface ParsedField {
	token: string;
	type: CronFieldType;
	kind: CronFieldKind;
	/** 匹配值集合（可枚举字段）；动态规则（L / W / #）为 null */
	matched: Set<number> | null;
	/** 匹配值升序数组；动态规则为 null */
	sorted: number[] | null;
	/** 动态规则参数：L / W 落在某一天时使用 */
	dayValue?: number;
	/** 动态规则参数：# 指定的星期几 */
	weekday?: number;
	/** 动态规则参数：# 指定的第几个（1-5） */
	nth?: number;
}

/** 解析后的表达式内部结构 */
export interface ParsedCron {
	ok: boolean;
	errors: string[];
	normalized: string;
	syntax: CronSyntaxKind;
	hasSeconds: boolean;
	hasYear: boolean;
	alias: string | null;
	fields: ParsedField[];
}

// ------------------------------------------------------------------
// 通用小工具
// ------------------------------------------------------------------

/** 去除首尾空白并合并连续空格 */
function normalizeExpression(input: string): string {
	return input.trim().replace(/\s+/g, ' ');
}

/** 统一别名大小写（@DAILY → @daily） */
function normalizeAlias(token: string): string {
	return token.toLowerCase();
}

/** 数组转匹配集合 */
function toSet(values: number[]): Set<number> {
	return new Set(values);
}

/** 解析单个数字：支持纯数字与月份 / 星期英文缩写 */
function parseNumber(raw: string, spec: FieldSpec): number | null {
	const text = raw.trim();
	if (!text) return null;
	if (/^\d+$/.test(text)) return Number(text);
	if (spec.alias) {
		const key = text.toLowerCase();
		const value = spec.alias[key];
		if (value !== undefined) return value;
	}
	return null;
}

/** 遍历范围内所有值 */
function eachValue(min: number, max: number, step: number): number[] {
	if (step <= 0) return [];
	const values: number[] = [];
	for (let value = min; value <= max; value += step) values.push(value);
	return values;
}

/** 数值转显示文本（月份与星期显示为中文名） */
function displayValue(type: CronFieldType, value: number): string {
	const spec = FIELD_SPEC[type];
	if (spec.names) {
		if (type === 'week') return WEEKDAY_NAMES[value === 7 ? 0 : value];
		return spec.names[value - spec.min] ?? String(value);
	}
	if (type === 'month') return `${value} 月`;
	if (type === 'year') return `${value} 年`;
	return String(value);
}

/** 时间补零 */
function pad2(value: number): string {
	return String(value).padStart(2, '0');
}

// ------------------------------------------------------------------
// 单字段解析
// ------------------------------------------------------------------

/** 解析单个 cron 字段，返回解析结果；失败时返回错误信息 */
function parseField(token: string, type: CronFieldType, stepBase?: number): { field?: ParsedField; error?: string } {
	const spec = FIELD_SPEC[type];
	const raw = token.trim();
	const upper = raw.toUpperCase();
	if (!raw) return { error: `${spec.label}字段为空` };

	// 通配符 *
	if (raw === '*') {
		const values = eachValue(spec.min, spec.max, 1);
		return { field: { token: raw, type, kind: 'any', matched: toSet(values), sorted: values } };
	}

	// Quartz 占位符 ?
	if (raw === '?') {
		const values = eachValue(spec.min, spec.max, 1);
		return { field: { token: raw, type, kind: 'any', matched: toSet(values), sorted: values } };
	}

	// 日期字段：L（最后一天）/ L-n（倒数第 n 天）/ LW（最后一个工作日）/ nW（最近的工作日）
	if (type === 'day' && (upper.includes('L') || upper.endsWith('W'))) {
		if (upper === 'L') {
			return { field: { token: raw, type, kind: 'lastDay', matched: null, sorted: null } };
		}
		if (upper === 'LW') {
			return { field: { token: raw, type, kind: 'nearestWeekday', matched: null, sorted: null } };
		}
		const offsetMatch = /^L-(\d{1,2})$/.exec(upper);
		if (offsetMatch) {
			const offset = Number(offsetMatch[1]);
			if (offset < 1 || offset > 30) return { error: `${spec.label}字段「${raw}」的 L-offset 超出范围（1-30）` };
			return { field: { token: raw, type, kind: 'lastDay', matched: null, sorted: null, dayValue: -offset } };
		}
		const weekdayMatch = /^(\d{1,2})W$/.exec(upper);
		if (weekdayMatch) {
			const dayValue = Number(weekdayMatch[1]);
			if (dayValue < 1 || dayValue > 31) return { error: `${spec.label}字段「${raw}」的日期超出范围（1-31）` };
			return { field: { token: raw, type, kind: 'nearestWeekday', matched: null, sorted: null, dayValue } };
		}
		return { error: `${spec.label}字段「${raw}」不支持该 L / W 写法` };
	}

	// 星期字段：d#n（第 n 个星期几）
	if (type === 'week' && upper.includes('#')) {
		const nthMatch = /^([A-Za-z0-9]+)#(\d+)$/.exec(raw);
		if (!nthMatch) return { error: `${spec.label}字段「${raw}」不支持该 # 写法（格式：星期几#第几个，如 5#2）` };
		const nth = Number(nthMatch[2]);
		if (nth < 1 || nth > 5) return { error: `${spec.label}字段「${raw}」的序号超出范围（1-5，表示当月第几个星期几）` };
		const weekday = parseNumber(nthMatch[1], spec);
		if (weekday === null) return { error: `${spec.label}字段「${raw}」中的星期几无法识别` };
		if (weekday < spec.min || weekday > spec.max) {
			return { error: `${spec.label}字段「${raw}」超出范围（${spec.rangeHint}）` };
		}
		const allDays = eachValue(FIELD_SPEC.day.min, FIELD_SPEC.day.max, 1);
		return {
			field: {
				token: raw,
				type,
				kind: 'nthWeekday',
				matched: toSet(allDays),
				sorted: allDays,
				weekday: weekday === 7 ? 0 : weekday,
				nth
			}
		};
	}

	// 列表：以逗号分隔，逐项解析后合并
	if (raw.includes(',')) {
		const matched = new Set<number>();
		const items = raw.split(',');
		for (const item of items) {
			const part = item.trim();
			if (!part) return { error: `${spec.label}字段「${raw}」中存在空的列表项` };
			const parsed = parseField(part, type, stepBase);
			if (parsed.error) return { error: parsed.error };
			const field = parsed.field!;
			if (!field.matched) return { error: `${spec.label}字段「${raw}」中不允许在列表里使用 ${part} 这类动态规则` };
			for (const value of field.matched) matched.add(value);
		}
		if (matched.size === 0) return { error: `${spec.label}字段「${raw}」没有匹配到任何值` };
		const sorted = [...matched].sort((a, b) => a - b);
		return { field: { token: raw, type, kind: 'list', matched, sorted } };
	}

	// 步长：a/b、*/b、a-c/b
	if (raw.includes('/')) {
		const segments = raw.split('/');
		if (segments.length !== 2) return { error: `${spec.label}字段「${raw}」的步长写法不合法（格式：起始/步长）` };
		const [base, stepText] = segments;
		if (!/^\d+$/.test(stepText.trim())) return { error: `${spec.label}字段「${raw}」的步长必须为正整数` };
		const step = Number(stepText.trim());
		if (step <= 0) return { error: `${spec.label}字段「${raw}」的步长必须大于 0` };

		let start = spec.min;
		let end = spec.max;
		// 年份步长从基准年（默认当前年）起算，避免 */2 落在 1970 这类历史起点上
		if (type === 'year' && stepBase !== undefined) {
			start = Math.min(Math.max(stepBase, spec.min), spec.max);
		}
		if (base.trim() !== '*' && base.trim() !== '?') {
			if (base.includes('-')) {
				const rangeParts = base.split('-');
				if (rangeParts.length !== 2) return { error: `${spec.label}字段「${raw}」的范围写法不合法` };
				const from = parseNumber(rangeParts[0], spec);
				const to = parseNumber(rangeParts[1], spec);
				if (from === null || to === null) return { error: `${spec.label}字段「${raw}」的范围值无法识别` };
				if (from < spec.min || from > spec.max || to < spec.min || to > spec.max) {
					return { error: `${spec.label}字段「${raw}」超出范围（${spec.rangeHint}）` };
				}
				if (from > to) return { error: `${spec.label}字段「${raw}」的范围起点不能大于终点` };
				start = from;
				end = to;
			} else {
				const from = parseNumber(base, spec);
				if (from === null) return { error: `${spec.label}字段「${raw}」的起始值无法识别` };
				if (from < spec.min || from > spec.max) {
					return { error: `${spec.label}字段「${raw}」超出范围（${spec.rangeHint}）` };
				}
				start = from;
			}
			if (step > end - start) {
				return { error: `${spec.label}字段「${raw}」的步长不能大于起始值到终点的跨度` };
			}
		}

		const values = eachValue(start, end, step);
		if (values.length === 0) return { error: `${spec.label}字段「${raw}」没有匹配到任何值` };
		const normalizedValues = type === 'week' ? values.map((value) => (value === 7 ? 0 : value)) : values;
		const matched = toSet(normalizedValues);
		return { field: { token: raw, type, kind: 'step', matched, sorted: [...matched].sort((a, b) => a - b) } };
	}

	// 范围：a-b
	if (raw.includes('-')) {
		const rangeParts = raw.split('-');
		if (rangeParts.length !== 2) return { error: `${spec.label}字段「${raw}」的范围写法不合法` };
		const from = parseNumber(rangeParts[0], spec);
		const to = parseNumber(rangeParts[1], spec);
		if (from === null || to === null) return { error: `${spec.label}字段「${raw}」的范围值无法识别` };
		if (from < spec.min || from > spec.max || to < spec.min || to > spec.max) {
			return { error: `${spec.label}字段「${raw}」超出范围（${spec.rangeHint}）` };
		}
		if (from > to) return { error: `${spec.label}字段「${raw}」的范围起点不能大于终点` };
		const values = eachValue(from, to, 1);
		const normalizedValues = type === 'week' ? values.map((value) => (value === 7 ? 0 : value)) : values;
		const matched = toSet(normalizedValues);
		return { field: { token: raw, type, kind: 'range', matched, sorted: [...matched].sort((a, b) => a - b) } };
	}

	// 单值
	if (type === 'day' && raw.includes('#')) {
		return { error: '「#」只能用于星期字段以表示当月第几个星期几，如 5#2' };
	}
	const single = parseNumber(raw, spec);
	if (single === null) return { error: `${spec.label}字段「${raw}」无法识别为数字${spec.alias ? '或英文名' : ''}` };
	if (single < spec.min || single > spec.max)
		return { error: `${spec.label}字段「${raw}」超出范围（${spec.rangeHint}）` };
	const normalized = type === 'week' && single === 7 ? 0 : single;
	return { field: { token: raw, type, kind: 'value', matched: toSet([normalized]), sorted: [normalized] } };
}

// ------------------------------------------------------------------
// 表达式解析
// ------------------------------------------------------------------

/**
 * 解析 cron 表达式（含别名与 @every 写法）
 *
 * @param input 表达式文本
 * @param baseYear 年份步长的基准年（默认当前年）
 */
export function parseCron(input: string, baseYear: number = new Date().getFullYear()): ParsedCron {
	const errors: string[] = [];
	const normalized = normalizeExpression(input);
	if (!normalized) {
		return {
			ok: false,
			errors: ['请输入 cron 表达式'],
			normalized: '',
			syntax: 'standard',
			hasSeconds: false,
			hasYear: false,
			alias: null,
			fields: []
		};
	}

	// 别名写法（@daily、@every 30m 等）
	if (normalized.startsWith('@')) {
		const parts = normalized.split(' ');
		const alias = normalizeAlias(parts[0]);
		if (alias === '@every') {
			if (!/^\d+[smh]$/.test(parts[1] ?? '')) {
				errors.push('@every 写法需指定间隔，如 @every 30m、@every 2h（单位：s / m / h）');
			}
			return {
				ok: errors.length === 0,
				errors,
				normalized,
				syntax: 'every',
				hasSeconds: false,
				hasYear: false,
				alias: '@every',
				fields: []
			};
		}
		const target = ALIAS_MAP[alias];
		if (!target) {
			errors.push(
				`不支持的别名「${parts[0]}」，可用：@yearly / @annually / @monthly / @weekly / @daily / @midnight / @hourly / @reboot / @every`
			);
			return {
				ok: false,
				errors,
				normalized,
				syntax: 'alias',
				hasSeconds: false,
				hasYear: false,
				alias,
				fields: []
			};
		}
		if (!target.expression) {
			// @reboot 没有固定时间点
			return {
				ok: true,
				errors: [],
				normalized,
				syntax: 'alias',
				hasSeconds: false,
				hasYear: false,
				alias,
				fields: []
			};
		}
		const expanded = parseCron(target.expression, baseYear);
		return {
			...expanded,
			normalized,
			syntax: 'alias',
			alias
		};
	}

	const tokens = normalized.split(' ');
	if (tokens.length < 5 || tokens.length > 7) {
		return {
			ok: false,
			errors: [
				`字段数量为 ${tokens.length}，仅支持 5 段（分 时 日 月 周）、6 段（秒 分 时 日 月 周）或 7 段（秒 分 时 日 月 周 年）`
			],
			normalized,
			syntax: 'standard',
			hasSeconds: false,
			hasYear: false,
			alias: null,
			fields: []
		};
	}

	const hasSeconds = tokens.length >= 6;
	const hasYear = tokens.length === 7;
	const types: CronFieldType[] = hasYear
		? [...SECOND_TYPES, 'year']
		: hasSeconds
			? [...SECOND_TYPES]
			: [...STANDARD_TYPES];

	const fields: ParsedField[] = [];
	for (let index = 0; index < tokens.length; index += 1) {
		const parsed = parseField(tokens[index], types[index], baseYear);
		if (parsed.error) {
			errors.push(parsed.error);
			continue;
		}
		fields.push(parsed.field!);
	}

	const syntax: CronSyntaxKind = hasYear ? 'withYear' : hasSeconds ? 'withSeconds' : 'standard';
	return {
		ok: errors.length === 0 && fields.length === tokens.length,
		errors,
		normalized,
		syntax,
		hasSeconds,
		hasYear,
		alias: null,
		fields
	};
}

// ------------------------------------------------------------------
// 中文语义描述
// ------------------------------------------------------------------

/** 单个字段的语义描述 */
function describeField(field: ParsedField): string {
	const { type, kind, token } = field;
	const spec = FIELD_SPEC[type];
	const items = field.sorted ? field.sorted.map((value) => displayValue(type, value)) : [];

	// 通配符
	if (kind === 'any') {
		if (type === 'second') return '每秒';
		if (type === 'minute') return '每分钟';
		if (type === 'hour') return '每小时';
		if (type === 'day') return token === '?' ? '不限日期（?）' : '每天';
		if (type === 'month') return '每月';
		if (type === 'week') return token === '?' ? '不限星期（?）' : '不限定星期';
		return '每年';
	}

	// 步长
	if (kind === 'step') {
		const base = token.split('/')[0].trim();
		const step = token.split('/')[1].trim();
		const isAll = base === '*' || base === '?';
		if (type === 'second') return isAll ? `每 ${step} 秒` : `从第 ${base} 秒起每 ${step} 秒`;
		if (type === 'minute') return isAll ? `每 ${step} 分钟` : `从第 ${base} 分起每 ${step} 分钟`;
		if (type === 'hour') return isAll ? `每 ${step} 小时` : `从 ${base} 点起每 ${step} 小时`;
		if (type === 'day') return isAll ? `每 ${step} 天` : `从 ${base} 号起每 ${step} 天`;
		if (type === 'month') return isAll ? `每 ${step} 个月` : `从 ${base} 月起每 ${step} 个月`;
		if (type === 'week') {
			return isAll ? `每 ${step} 天（按星期计）` : `从${displayValue('week', Number(base))}起每 ${step} 天（按星期计）`;
		}
		return isAll ? `每 ${step} 年` : `从 ${base} 年起每 ${step} 年`;
	}

	// 单值
	if (kind === 'value') {
		if (type === 'second') return `${pad2(Number(items[0]))} 秒`;
		if (type === 'minute') return `${pad2(Number(items[0]))} 分`;
		if (type === 'hour') return `${Number(items[0])} 点`;
		if (type === 'day') return `${items[0]} 号`;
		return items[0];
	}

	// 范围
	if (kind === 'range') {
		if (type === 'week') {
			if (token === '1-5') return '工作日';
			return `${items[0]}至${items[1]}`;
		}
		if (type === 'hour')
			return `${Number(field.sorted?.[0])} 点至 ${Number(field.sorted?.[field.sorted.length - 1])} 点`;
		if (type === 'day') return `${items[0]} 号至 ${items[1]} 号`;
		return `${items[0]} 至 ${items[1]}`;
	}

	// 列表
	if (kind === 'list') {
		const numbers = field.sorted ?? [];
		if (type === 'week') return items.join('、');
		if (type === 'hour') return `${numbers.map((value) => `${value} 点`).join('、')}`;
		if (type === 'second') return `第 ${numbers.join('、')} 秒`;
		if (type === 'minute') return `第 ${numbers.join('、')} 分`;
		if (type === 'day') return `${numbers.join('、')} 号`;
		if (numbers.length === 2) return `${items[0]}与${items[1]}`;
		return items.join('、');
	}

	// 动态规则
	if (kind === 'lastDay') {
		if (field.dayValue && field.dayValue < 0) return `倒数第 ${Math.abs(field.dayValue) + 1} 天`;
		return '当月最后一天';
	}
	if (kind === 'nearestWeekday') {
		if (field.dayValue) return `最接近 ${field.dayValue} 号的工作日`;
		return '当月最后一个工作日';
	}
	if (kind === 'nthWeekday') {
		const ordinal = ['第一个', '第二个', '第三个', '第四个', '第五个'][(field.nth ?? 1) - 1] ?? `第 ${field.nth} 个`;
		return `当月${ordinal}${WEEKDAY_NAMES[field.weekday ?? 0]}`;
	}
	return `（${spec.label}：${token}）`;
}

/**
 * 判断描述时间时是否需要带上「秒」
 *
 * 仅当表达式写了秒字段「且」该字段为动态规则（步长 / 列表 / 范围）时才带上秒；
 * 秒字段是单个固定值（如 Quartz 的 `0 0 12 * * ?`）时省略，避免「12:00 00 秒」这类赘述。
 */
function getTimeUnits(parsed: ParsedCron): CronFieldType[] {
	const second = parsed.fields.find((field) => field.type === 'second');
	const needSecond = Boolean(second && (second.kind === 'step' || second.kind === 'list' || second.kind === 'range'));
	return needSecond ? ['second', 'minute'] : ['minute'];
}

/**
 * 组装时间描述
 *
 * - 时 / 分均为确定值时给出「HH:mm(:ss)」
 * - 小时任意时用「第 N 分」表达，`hourly` 为真时补「每小时」前缀
 * - 其余情况退回各字段的自然语言描述，保证语义正确
 *
 * @param hour 小时字段（可能为空）
 * @param minute 分钟字段
 * @param withSecond 是否需要带秒
 * @param hourly 是否需要「每小时」前缀
 * @param second 秒字段（存在且需要展示时用于描述动态秒）
 */
function describeTime(
	hour: ParsedField | undefined,
	minute: ParsedField,
	withSecond: boolean,
	hourly: boolean,
	second?: ParsedField
): string {
	const suffix = withSecond ? ' 00 秒' : '';
	const prefix = hourly ? '每小时' : '';
	const hourOpen = hour === undefined || hour.kind === 'any';

	// 小时任意：用「第 N 分」表达，避免「每小时30」这类粘连；分不是确定值时退回描述
	if (hourOpen) {
		// 第 0 分即整点，如「0 * * * *」→「每小时整点」
		if (minute.kind === 'value' && minute.sorted?.[0] === 0 && !withSecond) return `${prefix}整点`;
		if (minute.kind === 'value' || minute.kind === 'list') {
			const minuteNumbers = minute.sorted?.map((value) => pad2(value)).join('、') ?? '';
			return `${prefix}第 ${minuteNumbers} 分${suffix}`;
		}
		return `${prefix}${describeField(minute)}${suffix}`;
	}

	// 时分均为确定值：直接给「HH:mm(:ss)」
	if (hour.kind === 'value' && minute.kind === 'value') {
		const text = `${pad2(Number(hour.sorted?.[0]))}:${pad2(Number(minute.sorted?.[0]))}`;
		return `${prefix}${text}${withSecond ? ':00' : ''}`;
	}

	// 其余情况：小时描述 + 分描述（秒为动态规则时一并描述）
	const extra = withSecond && second && second.kind !== 'value' ? ` ${describeField(second)}` : suffix;
	return `${prefix}${describeField(hour)} ${describeField(minute)}${extra}`;
}

/** 拼接完整中文描述 */
function buildDescription(parsed: ParsedCron): string {
	if (parsed.alias) {
		const alias = normalizeAlias(parsed.alias);
		if (alias === '@every') return `按固定间隔执行：${parsed.normalized.replace('@every', '').trim()} 一次`;
		const target = ALIAS_MAP[alias];
		return target ? target.description : `${alias}（别名表达式）`;
	}
	if (!parsed.ok || parsed.fields.length === 0) return '';

	const byType = new Map<CronFieldType, ParsedField>();
	for (const field of parsed.fields) byType.set(field.type, field);
	const get = (type: CronFieldType) => byType.get(type);

	const year = get('year');
	const month = get('month');
	const day = get('day');
	const week = get('week');
	const hour = get('hour');
	const minute = get('minute');
	const second = get('second');

	const parts: string[] = [];
	if (month && month.kind !== 'any') parts.push(describeField(month));

	const dayAny = !day || day.kind === 'any';
	const weekAny = !week || week.kind === 'any';

	// 日期 / 星期限定
	if (!dayAny && !weekAny) {
		parts.push(`${describeField(day!)}或${describeField(week!)}`);
	} else if (!dayAny) {
		parts.push(describeField(day!));
	} else if (!weekAny) {
		parts.push(describeField(week!));
	}

	// ---- 时间部分：把秒 / 分 / 时合成一句自然语言 ----
	const hourAny = !hour || hour.kind === 'any';
	const minuteAny = !minute || minute.kind === 'any';
	const secondAny = !second || second.kind === 'any';
	const dateUnrestricted = dayAny && weekAny;
	const withSecond = getTimeUnits(parsed).includes('second');

	if (minuteAny) {
		// 分钟为任意值：时间描述由小时（或秒）决定
		if (hourAny) {
			if (secondAny) parts.push('每小时');
			else parts.push(dateUnrestricted ? `每小时${describeField(second!)}` : describeField(second!));
		} else {
			// 仅小时受限，如「0 9 * * *」→「每天 9 点」
			const hourText = describeField(hour!);
			parts.push(dateUnrestricted ? `每天 ${hourText}` : hourText);
		}
	} else if (hour === undefined || hour.kind === 'value') {
		// 时分（可含秒）都是确定值，直接给出「HH:mm(:ss)」，如「30 2 * * *」→「每天 02:30」
		const timeText = describeTime(hour, minute!, withSecond, hourAny);
		parts.push(dateUnrestricted ? `每天 ${timeText}` : timeText);
	} else if (hourAny) {
		// 小时任意、分钟受限，如「30 * * * *」→「每小时第 30 分」
		parts.push(describeTime(undefined, minute!, withSecond, true, second));
	} else {
		// 小时为动态规则、分钟受限，如「0 */2 9-18 * * 1-5」
		const hourText = describeField(hour);
		parts.push(dateUnrestricted ? `每天 ${hourText}` : hourText);
		parts.push(describeTime(undefined, minute!, withSecond, false, second));
	}

	// 年字段放在句末：* 写作「每年」，具体年 / 步长写作对应描述
	if (year && year.kind !== 'any') parts.push(describeField(year));

	// 各字段描述可能自带尾部空格，这里统一裁剪后以单空格拼接，保证句读一致
	const body = parts
		.map((part) => part.trim())
		.filter(Boolean)
		.join(' ');
	return body ? `在 ${body} 执行` : '每分钟执行';
}

/** 解析字段的匹配值文本 */
function buildValuesText(field: ParsedField): string | null {
	if (!field.sorted) return null;
	if (field.type === 'week') return field.sorted.map((value) => WEEKDAY_NAMES[value]).join('、');
	return field.sorted.map((value) => displayValue(field.type, value)).join('、');
}

/** 解析并生成完整结果（含字段明细），供视图直接使用 */
export function analyzeCron(input: string): CronParseResult {
	const parsed = parseCron(input);
	const fields: CronFieldDetail[] = parsed.fields.map((field) => ({
		type: field.type,
		label: FIELD_SPEC[field.type].label,
		token: field.token,
		count: field.matched ? field.matched.size : 0,
		valuesText: buildValuesText(field),
		description: describeField(field)
	}));

	return {
		ok: parsed.ok,
		errors: parsed.errors,
		normalized: parsed.normalized,
		syntax: parsed.syntax,
		hasSeconds: parsed.hasSeconds,
		hasYear: parsed.hasYear,
		alias: parsed.alias,
		description: buildDescription(parsed),
		fields
	};
}

// ------------------------------------------------------------------
// 日期匹配与执行时间预览
// ------------------------------------------------------------------

/** 某月的天数（month 为 1-12；本地时间与 UTC 的天数一致，用 UTC 计算避免时区干扰） */
function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 指定日期的星期序号（0 为周日），按本地日期判定 */
function weekdayOf(year: number, month: number, day: number): number {
	return new Date(year, month - 1, day).getDay();
}

/** 指定日期是否为工作日（周一至周五） */
function isWeekday(year: number, month: number, day: number): boolean {
	const weekday = weekdayOf(year, month, day);
	return weekday >= 1 && weekday <= 5;
}

/** 判断日期字段是否命中（含 L / W 动态规则） */
function matchDay(field: ParsedField, date: Date): boolean {
	if (field.kind === 'any') return true;
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const lastDay = daysInMonth(year, month);

	if (field.kind === 'lastDay') {
		if (field.dayValue && field.dayValue < 0) return day === lastDay + field.dayValue + 1;
		return day === lastDay;
	}

	if (field.kind === 'nearestWeekday') {
		// LW：当月最后一个工作日
		if (!field.dayValue) {
			let cursor = lastDay;
			while (cursor >= 1 && !isWeekday(year, month, cursor)) cursor -= 1;
			return day === cursor;
		}
		// nW：最接近 n 号的工作日（超出当月时前置到上月末）
		const target = Math.min(field.dayValue, lastDay);
		if (isWeekday(year, month, target)) return day === target;
		if (target === 1) return day === 2 && isWeekday(year, month, 2);
		if (target === lastDay) {
			let cursor = lastDay - 1;
			while (cursor >= 1 && !isWeekday(year, month, cursor)) cursor -= 1;
			return day === cursor;
		}
		if (!isWeekday(year, month, target - 1)) return false;
		// 目标日落在周六时取前一天（周五），落在周日时取后一天（周一）
		const weekday = weekdayOf(year, month, target);
		return weekday === 6 ? day === target - 1 : day === target + 1;
	}

	return field.matched ? field.matched.has(day) : true;
}

/** 判断星期字段是否命中（含 # 第 n 个星期几） */
function matchWeek(field: ParsedField, date: Date): boolean {
	if (field.kind === 'any') return true;
	const weekday = date.getDay();
	if (field.kind === 'nthWeekday') {
		if (weekday !== field.weekday) return false;
		return Math.floor((date.getDate() - 1) / 7) + 1 === field.nth;
	}
	return field.matched ? field.matched.has(weekday) : true;
}

/** 判断日期维度（年 / 月 / 日 / 星期）是否命中表达式，不检查时 / 分 / 秒 */
function matchesDayGroup(date: Date, fields: Map<CronFieldType, ParsedField>): boolean {
	const year = fields.get('year');
	const month = fields.get('month');
	const day = fields.get('day');
	const week = fields.get('week');

	if (year && !year.matched?.has(date.getFullYear())) return false;
	if (month && !month.matched?.has(date.getMonth() + 1)) return false;

	const dayAny = !day || day.kind === 'any';
	const weekAny = !week || week.kind === 'any';
	// cron 约定：日期与星期同时被限定时，满足任意一个即可
	if (dayAny && weekAny) return true;
	if (dayAny) return matchWeek(week!, date);
	if (weekAny) return matchDay(day!, date);
	return matchDay(day!, date) || matchWeek(week!, date);
}

/** 判断某个时刻是否命中表达式（日期维度 + 时 / 分 / 秒） */
function matches(date: Date, fields: Map<CronFieldType, ParsedField>): boolean {
	const second = fields.get('second');
	const minute = fields.get('minute');
	const hour = fields.get('hour');

	if (second && !second.matched?.has(date.getSeconds())) return false;
	if (minute && !minute.matched?.has(date.getMinutes())) return false;
	if (hour && !hour.matched?.has(date.getHours())) return false;
	return matchesDayGroup(date, fields);
}

/** 相对时间中文描述 */
function formatRelative(diffMs: number): string {
	const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
	if (totalSeconds < 60) return `${totalSeconds} 秒后`;
	const totalMinutes = Math.floor(totalSeconds / 60);
	if (totalMinutes < 60) return `${totalMinutes} 分钟后`;
	const totalHours = Math.floor(totalMinutes / 60);
	if (totalHours < 24) return `${totalHours} 小时后`;
	const totalDays = Math.floor(totalHours / 24);
	if (totalDays < 30) return `${totalDays} 天后`;
	const totalMonths = Math.floor(totalDays / 30);
	if (totalMonths < 12) return `约 ${totalMonths} 个月后`;
	return `约 ${Math.floor(totalMonths / 12)} 年后`;
}

/** 读取时间戳对应的本地时间文本 */
function toLocalText(date: Date): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/** 读取时间戳对应的 UTC 时间文本 */
function toUtcText(date: Date): string {
	return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
}

/**
 * 判断表达式是否属于「日期维度稀疏」：这类表达式逐分钟扫描会空转，应改为逐天扫描。
 * 逐天扫描只在小时与分钟均为明确值时才不会漏算（否则同一天内的多个时刻会被跳过）。
 */
function isSparseDayExpression(parsed: ParsedCron): boolean {
	const byType = new Map<CronFieldType, ParsedField>();
	for (const field of parsed.fields) byType.set(field.type, field);

	const year = byType.get('year');
	const month = byType.get('month');
	const day = byType.get('day');
	const week = byType.get('week');
	const hour = byType.get('hour');
	const minute = byType.get('minute');

	const hasRestrictedDayGroup = [month, day, week].some((field) => field !== undefined && field.kind !== 'any');
	if (!year && !hasRestrictedDayGroup) return false;

	// 小时或分钟为通配时，同一天内存在多个执行时刻，逐天扫描会漏算，必须逐分钟扫描
	const hourOpen = hour === undefined || hour.kind === 'any';
	const minuteOpen = minute === undefined || minute.kind === 'any';
	if (hourOpen || minuteOpen) return false;
	return true;
}

/** 计算下一次执行时刻：从 from 之后开始向后扫描 */
function computeNextRuns(
	parsed: ParsedCron,
	count: number,
	from: Date,
	capByDay: boolean
): { dates: Date[]; truncated: boolean } {
	const fields = new Map<CronFieldType, ParsedField>();
	for (const field of parsed.fields) fields.set(field.type, field);

	const dates: Date[] = [];
	const MAX_ITERATIONS = 400000;
	const MINUTE_MS = 60000;
	const HOUR_VALUES = eachValue(0, 23, 1);
	const MINUTE_VALUES = eachValue(0, 59, 1);
	/** 是否至少命中过一次（用于区分「表达式不可能触发」与「扫描被截断」） */
	let found = false;

	/**
	 * 按天推进：适用于月度 / 年度这类稀疏表达式
	 *
	 * 小时或分钟为通配时，同一天内可能有多个命中时刻，需在当天内找出最早的一刻，
	 * 直接取 00:00:00 会得到错误结果（例如「0 9 * * 5」会退化成 00:00:00）。
	 */
	if (capByDay) {
		// 当天内可能命中的时刻集合：小时 / 分钟为明确值时常量很小，
		// 否则逐天扫描必然在 00:00:00 命中，无需枚举整天的 1440 个时刻
		const timePairs: { hour: number; minute: number }[] = [];
		const hour = fields.get('hour');
		const minute = fields.get('minute');
		const hourValues = hour && hour.kind !== 'any' && hour.sorted ? hour.sorted : HOUR_VALUES;
		const minuteValues = minute && minute.kind !== 'any' && minute.sorted ? minute.sorted : MINUTE_VALUES;

		const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
		cursor.setDate(cursor.getDate() + 1);
		let iteration = 0;
		while (dates.length < count && iteration < MAX_ITERATIONS) {
			const year = cursor.getFullYear();
			const month = cursor.getMonth();
			const dayOfMonth = cursor.getDate();
			// 日期维度先判断，避免对不可能命中的日期枚举时刻
			const dayMatched = matchesDayGroup(new Date(year, month, dayOfMonth), fields);
			if (dayMatched) {
				if (timePairs.length === 0) {
					for (const hourValue of hourValues) {
						for (const minuteValue of minuteValues) timePairs.push({ hour: hourValue, minute: minuteValue });
					}
					timePairs.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
				}
				for (const pair of timePairs) {
					const candidate = new Date(year, month, dayOfMonth, pair.hour, pair.minute, 0, 0);
					if (matches(candidate, fields)) {
						dates.push(candidate);
						found = true;
						break;
					}
				}
			}
			cursor.setDate(cursor.getDate() + 1);
			iteration += 1;
		}
		return { dates, truncated: dates.length < count && found };
	}

	// 按分钟推进（含秒字段时在同一分钟内枚举所有秒）
	const seconds = fields.get('second');
	const secondList = seconds && seconds.sorted && seconds.sorted.length > 0 ? seconds.sorted : null;
	const secondAny = !seconds || seconds.kind === 'any';
	const base = new Date(Math.floor(from.getTime() / MINUTE_MS) * MINUTE_MS);
	if (!secondAny && secondList) {
		for (const value of secondList) {
			const candidate = new Date(base.getTime() + value * 1000);
			if (candidate.getTime() > from.getTime() && matches(candidate, fields)) {
				dates.push(candidate);
				found = true;
				if (dates.length >= count) return { dates, truncated: false };
			}
		}
	}
	const cursor = new Date(base.getTime() + MINUTE_MS);

	let iteration = 0;
	while (dates.length < count && iteration < MAX_ITERATIONS) {
		if (secondAny) {
			if (matches(cursor, fields)) {
				dates.push(new Date(cursor.getTime()));
				found = true;
			}
		} else {
			for (const value of secondList ?? [0]) {
				const candidate = new Date(cursor.getTime() + value * 1000);
				if (matches(candidate, fields)) {
					dates.push(candidate);
					found = true;
					if (dates.length >= count) break;
				}
			}
		}
		cursor.setTime(cursor.getTime() + MINUTE_MS);
		iteration += 1;
	}
	return { dates, truncated: dates.length < count && found };
}

/**
 * 计算接下来若干次执行时间
 *
 * @param expression cron 表达式
 * @param count 需要的条数
 * @param fromMs 计算起点（默认当前时间）
 */
export function previewCronRuns(expression: string, count: number, fromMs: number = Date.now()): CronPreviewResult {
	const parsed = parseCron(expression, new Date(fromMs).getFullYear());
	if (!parsed.ok || parsed.syntax === 'every' || normalizeAlias(parsed.alias ?? '') === NON_TIME_ALIAS) {
		return { items: [], remaining: 0 };
	}

	const from = new Date(fromMs);
	// 日期维度非常稀疏的表达式按天推进，避免逐分钟空转（此时时刻字段必须是明确值，否则会漏算）
	const sparse = isSparseDayExpression(parsed);

	const { dates, truncated } = computeNextRuns(parsed, count, from, sparse);
	const items: CronRunItem[] = dates.map((date, index) => ({
		index: index + 1,
		timestampMs: date.getTime(),
		localText: toLocalText(date),
		utcText: toUtcText(date),
		relative: formatRelative(date.getTime() - fromMs)
	}));

	return { items, remaining: truncated ? count - items.length : 0 };
}

// ------------------------------------------------------------------
// 编辑器辅助：模板、占位符、字段构建器
// ------------------------------------------------------------------

/** 表达式模板（一键填充完整表达式） */
export const CRON_TEMPLATES: { label: string; expression: string }[] = [
	{ label: '每 5 分钟', expression: '*/5 * * * *' },
	{ label: '每小时整点', expression: '0 * * * *' },
	{ label: '每天零点', expression: '0 0 * * *' },
	{ label: '每天 9 点', expression: '0 9 * * *' },
	{ label: '工作日 9 点', expression: '0 9 * * 1-5' },
	{ label: '每周一 9 点', expression: '0 9 * * 1' },
	{ label: '每月 1 号零点', expression: '0 0 1 * *' },
	{ label: '每月最后一天', expression: '0 0 L * *' },
	{ label: '每 30 秒', expression: '*/30 * * * * *' },
	{ label: '每天中午（Quartz）', expression: '0 0 12 * * ?' }
];

/** 常用占位符 / 特殊字符（点击插入到光标处） */
export const CRON_PLACEHOLDERS: CronPlaceholder[] = [
	{ text: '*', label: '*', hint: '任意值（通配）' },
	{ text: '?', label: '?', hint: '不指定（Quartz 日期 / 星期占位）' },
	{ text: ',', label: ',', hint: '列表分隔，如 1,3,5' },
	{ text: '-', label: '-', hint: '范围，如 1-5' },
	{ text: '/', label: '/', hint: '步长，如 */5' },
	{ text: 'L', label: 'L', hint: '最后一天 / 最后一个星期几' },
	{ text: 'W', label: 'W', hint: '最近的工作日，如 15W' },
	{ text: '#', label: '#', hint: '第 n 个星期几，如 5#2' }
];

/** 字段快捷选项定义 */
interface BuilderOptionSpec {
	label: string;
	value: string;
}

/** 各字段的快捷选项 */
const BUILDER_OPTIONS: Record<CronFieldType, BuilderOptionSpec[]> = {
	second: [
		{ label: '每秒（*）', value: '*' },
		{ label: '第 0 秒', value: '0' },
		{ label: '每 5 秒', value: '*/5' },
		{ label: '每 10 秒', value: '*/10' },
		{ label: '每 15 秒', value: '*/15' },
		{ label: '每 30 秒', value: '*/30' }
	],
	minute: [
		{ label: '每分钟（*）', value: '*' },
		{ label: '第 0 分', value: '0' },
		{ label: '第 30 分', value: '30' },
		{ label: '每 5 分钟', value: '*/5' },
		{ label: '每 10 分钟', value: '*/10' },
		{ label: '每 15 分钟', value: '*/15' },
		{ label: '每 30 分钟', value: '*/30' },
		{ label: '0 与 30 分', value: '0,30' }
	],
	hour: [
		{ label: '每小时（*）', value: '*' },
		{ label: '0 点', value: '0' },
		{ label: '9 点', value: '9' },
		{ label: '12 点', value: '12' },
		{ label: '18 点', value: '18' },
		{ label: '每 2 小时', value: '*/2' },
		{ label: '每 6 小时', value: '*/6' },
		{ label: '9-18 点', value: '9-18' }
	],
	day: [
		{ label: '每天（*）', value: '*' },
		{ label: '1 号', value: '1' },
		{ label: '15 号', value: '15' },
		{ label: '1 与 15 号', value: '1,15' },
		{ label: '最后一天（L）', value: 'L' },
		{ label: '最近工作日（15W）', value: '15W' },
		{ label: '每月最后工作日（LW）', value: 'LW' },
		{ label: '不指定（?）', value: '?' }
	],
	month: [
		{ label: '每月（*）', value: '*' },
		{ label: '1 月', value: '1' },
		{ label: '6 月', value: '6' },
		{ label: '12 月', value: '12' },
		{ label: '每季度（*/3）', value: '*/3' },
		{ label: '1 月与 7 月', value: '1,7' }
	],
	week: [
		{ label: '不限（*）', value: '*' },
		{ label: '周一', value: '1' },
		{ label: '周五', value: '5' },
		{ label: '周日', value: '0' },
		{ label: '工作日（1-5）', value: '1-5' },
		{ label: '周末（0,6）', value: '0,6' },
		{ label: '第二个周五（5#2）', value: '5#2' },
		{ label: '不指定（?）', value: '?' }
	],
	year: [
		{ label: '每年（*）', value: '*' },
		{ label: '2026 年', value: '2026' },
		{ label: '每 2 年', value: '*/2' }
	]
};

/** 构建器上下文：给出各字段分片与类型，供 UI 拆分编辑 */
export function buildBuilderContext(expression: string): CronBuilderContext {
	const parsed = parseCron(expression);
	const tokens = parsed.normalized.split(' ').filter(Boolean);
	let types: CronFieldType[];
	if (parsed.syntax === 'alias' || parsed.syntax === 'every') {
		types = STANDARD_TYPES;
	} else if (parsed.hasYear) {
		types = [...SECOND_TYPES, 'year'];
	} else if (parsed.hasSeconds) {
		types = [...SECOND_TYPES];
	} else {
		types = [...STANDARD_TYPES];
	}
	return {
		expression: parsed.normalized,
		tokens,
		types: types.slice(0, tokens.length),
		hasSeconds: parsed.hasSeconds,
		ok: parsed.ok
	};
}

/** 生成字段编辑器的字段配置列表 */
export function buildBuilderFields(context: CronBuilderContext): CronBuilderField[] {
	return context.tokens.map((token, index) => {
		const type = context.types[index];
		const options = BUILDER_OPTIONS[type] ?? [];
		const matched = options.find((option) => option.value === token);
		return {
			type,
			label: FIELD_SPEC[type].label,
			index,
			token,
			selected: matched ? matched.value : null,
			options,
			rangeHint: FIELD_SPEC[type].rangeHint
		};
	});
}

/** 替换表达式中的某一个字段分片 */
export function replaceCronField(expression: string, index: number, token: string): string {
	const meta = buildBuilderContext(expression);
	const tokens = meta.tokens.length > 0 ? [...meta.tokens] : ['*', '*', '*', '*', '*'];
	if (index < 0 || index >= tokens.length) return expression;
	tokens[index] = token.trim() || '*';
	return tokens.join(' ');
}

/** 判断是否为可预览时间的表达式 */
export function isPreviewable(expression: string): boolean {
	const parsed = parseCron(expression);
	if (!parsed.ok) return false;
	if (parsed.syntax === 'every') return false;
	return normalizeAlias(parsed.alias ?? '') !== NON_TIME_ALIAS;
}

/** 表达式书写风格的中文说明 */
export function describeSyntax(syntax: CronSyntaxKind, hasSeconds: boolean, hasYear: boolean): string {
	if (syntax === 'alias') return '别名写法（@daily 等）';
	if (syntax === 'every') return '间隔写法（@every）';
	if (hasYear) return '7 段式：秒 分 时 日 月 周 年';
	if (hasSeconds) return '6 段式：秒 分 时 日 月 周';
	return '5 段式：分 时 日 月 周';
}

/** 是否为别名 / 间隔类写法（此类表达式不支持字段级构建器改写） */
export function hasAliasSyntax(expression: string): boolean {
	const syntax = parseCron(expression).syntax;
	return syntax === 'alias' || syntax === 'every';
}

/** 校验表达式（返回错误列表，空数组表示通过） */
export function validateCron(expression: string): string[] {
	return parseCron(expression).errors;
}

export { FIELD_SPEC as CRON_FIELD_SPEC };
