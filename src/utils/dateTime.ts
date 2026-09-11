// 时间日期转换器：任意格式识别、时区换算与多格式输出
import type {
	DateFormatItem,
	DateTimeParseResult,
	ParseRule,
	RuleParseResult,
	TimezoneOption,
	WallClock,
	ZonedParts
} from '@/types/datetime';

export type {
	DateFormatItem,
	DateTimeParseResult,
	DateTimeParseSuccess,
	TimezoneOption,
	WallClock,
	ZonedParts
} from '@/types/datetime';

/** 当前浏览器时区（如 Asia/Shanghai） */
export function getCurrentTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
}

/** 未实现 Intl.supportedValuesOf 时的回退时区清单 */
const FALLBACK_TIMEZONES = [
	'UTC',
	'Asia/Shanghai',
	'Asia/Hong_Kong',
	'Asia/Taipei',
	'Asia/Tokyo',
	'Asia/Seoul',
	'Asia/Singapore',
	'Asia/Bangkok',
	'Asia/Kolkata',
	'Asia/Dubai',
	'Europe/London',
	'Europe/Paris',
	'Europe/Berlin',
	'Europe/Moscow',
	'Africa/Cairo',
	'Africa/Johannesburg',
	'America/New_York',
	'America/Chicago',
	'America/Denver',
	'America/Los_Angeles',
	'America/Sao_Paulo',
	'Australia/Sydney',
	'Australia/Perth',
	'Pacific/Auckland'
];

/** 时区下拉选项：本地时区置顶，其余按名称排序 */
export function getTimezoneOptions(): TimezoneOption[] {
	const local = getCurrentTimezone();
	let zoneList: string[];
	const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
	try {
		zoneList = typeof intl.supportedValuesOf === 'function' ? intl.supportedValuesOf('timeZone') : FALLBACK_TIMEZONES;
	} catch {
		zoneList = FALLBACK_TIMEZONES;
	}
	const zones = [...new Set([local, 'UTC', ...zoneList])].sort((a, b) => a.localeCompare(b));
	return zones.map((zone) => ({
		label: zone === local ? `${zone}（本地时区）` : zone,
		value: zone
	}));
}

/** 取某一时刻在指定时区下的墙上时间各部分 */
export function getZonedParts(date: Date, timeZone: string): ZonedParts {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		weekday: 'short'
	}).formatToParts(date);
	const map: Record<string, string> = {};
	for (const part of parts) map[part.type] = part.value;
	const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
	return {
		year: Number(map.year),
		month: Number(map.month),
		day: Number(map.day),
		hour: Number(map.hour),
		minute: Number(map.minute),
		second: Number(map.second),
		millisecond: date.getMilliseconds(),
		weekday: weekdayMap[map.weekday] ?? 0
	};
}

/** 取某一时刻在指定时区的偏移分钟数（东为正，如东八区为 480） */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
	const parts = getZonedParts(date, timeZone);
	const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
	return (asUTC - (date.getTime() - date.getMilliseconds())) / 60000;
}

/**
 * 把「某时区下的墙上时间」换算为绝对时刻。
 * 通过两次偏移修正处理夏令时边界，保证跨 DST 切换时结果正确。
 */
export function zonedTimeToDate(wall: WallClock, timeZone: string): Date {
	const utcGuess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second, wall.millisecond);
	const firstOffset = getTimezoneOffsetMinutes(new Date(utcGuess), timeZone);
	let timestamp = utcGuess - firstOffset * 60000;
	const secondOffset = getTimezoneOffsetMinutes(new Date(timestamp), timeZone);
	if (secondOffset !== firstOffset) timestamp = utcGuess - secondOffset * 60000;
	return new Date(timestamp);
}

/** 偏移分钟数格式化为 +08:00 / -05:30 */
export function formatOffset(minutes: number): string {
	const sign = minutes >= 0 ? '+' : '-';
	const abs = Math.abs(minutes);
	return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** 墙上时间格式化为 YYYY-MM-DD HH:mm:ss（供「填入当前时间」等场景使用） */
export function formatWallClock(wall: WallClock): string {
	return `${wall.year}-${pad(wall.month)}-${pad(wall.day)} ${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`;
}

/** 数字补零 */
function pad(value: number, length = 2): string {
	return String(Math.abs(value)).padStart(length, '0');
}

/** 是否为合法日历时间（拦截 2 月 30 日、25 点等） */
function isCalendarValid(wall: WallClock): boolean {
	if (wall.month < 1 || wall.month > 12 || wall.day < 1 || wall.day > 31) return false;
	if (wall.hour > 23 || wall.minute > 59 || wall.second > 59) return false;
	const probe = new Date(
		Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second, wall.millisecond)
	);
	return (
		probe.getUTCFullYear() === wall.year &&
		probe.getUTCMonth() === wall.month - 1 &&
		probe.getUTCDate() === wall.day &&
		probe.getUTCHours() === wall.hour &&
		probe.getUTCMinutes() === wall.minute &&
		probe.getUTCSeconds() === wall.second
	);
}

/** 英文月份名 → 月份数字 */
const MONTH_NAMES: Record<string, number> = {
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

/** RFC 2822 常见时区缩写 → 偏移分钟（仅在该格式下使用，避免 CST 等歧义扩散） */
const ZONE_ABBR: Record<string, number> = {
	ut: 0,
	utc: 0,
	gmt: 0,
	est: -300,
	edt: -240,
	cst: -360,
	cdt: -300,
	mst: -420,
	mdt: -360,
	pst: -480,
	pdt: -420
};

/** 解析时区标记（Z / UTC / GMT / ±HH:mm / ±HHmm），无法识别返回 undefined */
function parseZoneToken(token: string | undefined): number | undefined {
	if (!token) return undefined;
	const value = token.trim().toUpperCase();
	if (value === 'Z' || value === 'UTC' || value === 'GMT' || value === 'UT') return 0;
	const match = /^([+-])(\d{2}):?(\d{2})$/.exec(value);
	if (match) {
		const minutes = Number(match[2]) * 60 + Number(match[3]);
		return match[1] === '-' ? -minutes : minutes;
	}
	return ZONE_ABBR[value.toLowerCase()];
}

/** 两位年份补全：00-68 → 20xx，69-99 → 19xx */
function expandYear(year: number): number {
	if (year >= 100) return year;
	return year <= 68 ? 2000 + year : 1900 + year;
}

/** 构造墙上时间（自动补默认值） */
function wallOf(
	year: number,
	month: number,
	day: number,
	hour = 0,
	minute = 0,
	second = 0,
	millisecond = 0
): WallClock {
	return { year, month, day, hour, minute, second, millisecond };
}

/** 判断数字是否在合理取值范围内（超出则本规则不适用） */
function inRange(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): boolean {
	return (
		year >= 1 &&
		year <= 9999 &&
		month >= 1 &&
		month <= 12 &&
		day >= 1 &&
		day <= 31 &&
		hour >= 0 &&
		hour <= 23 &&
		minute >= 0 &&
		minute <= 59 &&
		second >= 0 &&
		second <= 59
	);
}

/** 解析 12 小时制为 24 小时制 */
function to24Hour(hour: number, meridiem: string | undefined): number {
	if (!meridiem) return hour;
	const upper = meridiem.toUpperCase();
	if (upper === 'AM') return hour === 12 ? 0 : hour;
	return hour === 12 ? 12 : hour + 12;
}

/** 取今天（指定时区）的墙上日期 */
function todayInZone(timeZone: string): WallClock {
	const parts = getZonedParts(new Date(), timeZone);
	return wallOf(parts.year, parts.month, parts.day);
}

/** 对今天的墙上日期做天数偏移（按目标时区日历日计算） */
function shiftDays(base: WallClock, days: number, timeZone: string): WallClock {
	const date = zonedTimeToDate(wallOf(base.year, base.month, base.day, 12), timeZone);
	date.setUTCDate(date.getUTCDate() + days);
	const parts = getZonedParts(date, timeZone);
	return wallOf(parts.year, parts.month, parts.day);
}

/** 带时区标记的日期时间正则片段 */
const ZONE_PATTERN = '(Z|[+-]\\d{2}:?\\d{2}|UTC|GMT|UT)';

/** 全部解析规则：顺序敏感，歧义格式（紧凑数字）需排在时间戳之前 */
const PARSE_RULES: ParseRule[] = [
	// 1. 相对时间词
	{
		id: 'relative-word',
		name: '相对时间词',
		pattern: /^(now|today|yesterday|tomorrow)$/i,
		parse: (match, zone) => {
			const word = match[1].toLowerCase();
			if (word === 'now') {
				const now = new Date();
				const parts = getZonedParts(now, zone);
				return { wall: { ...parts, millisecond: now.getMilliseconds() }, note: '按当前时刻解析' };
			}
			const base = todayInZone(zone);
			const wall = word === 'today' ? base : shiftDays(base, word === 'yesterday' ? -1 : 1, zone);
			return { wall, note: '按当日零点解析' };
		}
	},
	// 2. ISO 8601 与标准分隔日期（4 位年份开头）
	{
		id: 'iso',
		name: 'ISO 8601 / 标准日期时间',
		pattern: new RegExp(
			`^(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})(?:[ T](\\d{1,2}):(\\d{1,2})(?::(\\d{1,2})(?:\\.(\\d{1,3}))?)?)?\\s*${ZONE_PATTERN}?$`,
			'i'
		),
		parse: (match) => {
			const [year, month, day, hour, minute, second, milli, zoneToken] = [
				Number(match[1]),
				Number(match[2]),
				Number(match[3]),
				Number(match[4] ?? 0),
				Number(match[5] ?? 0),
				Number(match[6] ?? 0),
				Number((match[7] ?? '0').padEnd(3, '0')),
				match[8]
			];
			if (!inRange(year, month, day, hour, minute, second)) return null;
			const explicitOffset = parseZoneToken(zoneToken);
			return {
				wall: wallOf(year, month, day, hour, minute, second, milli),
				explicitOffset,
				note: hour === 0 && minute === 0 && !match[4] ? '仅日期，时间按 00:00:00 处理' : ''
			};
		}
	},
	// 3. 斜杠 / 短横线日期（年非 4 位开头，存在 月/日 与 日/月 歧义）
	{
		id: 'ambiguous-date',
		name: '斜杠日期（月/日/年 或 日/月/年）',
		pattern: new RegExp(
			`^(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})(?:[ ,T]+(\\d{1,2}):(\\d{1,2})(?::(\\d{1,2})(?:\\.(\\d{1,3}))?)?\\s*(AM|PM)?)?\\s*${ZONE_PATTERN}?$`,
			'i'
		),
		parse: (match) => {
			const first = Number(match[1]);
			const second = Number(match[2]);
			const year = expandYear(Number(match[3]));
			// 第一个数大于 12 说明是「日/月/年」，否则按美式「月/日/年」
			const dayFirst = first > 12;
			const month = dayFirst ? second : first;
			const day = dayFirst ? first : second;
			const hour = to24Hour(Number(match[4] ?? 0), match[8] ?? undefined);
			const minute = Number(match[5] ?? 0);
			const secondValue = Number(match[6] ?? 0);
			if (!inRange(year, month, day, hour, minute, secondValue)) return null;
			return {
				wall: wallOf(year, month, day, hour, minute, secondValue, Number((match[7] ?? '0').padEnd(3, '0'))),
				explicitOffset: parseZoneToken(match[9]),
				note: dayFirst ? '按 日/月/年 解释' : '按 月/日/年 解释（美式）'
			};
		}
	},
	// 4. 紧凑数字日期（YYYYMMDD / YYYYMMDDHH / YYYYMMDDHHmm / YYYYMMDDHHmmss）
	{
		id: 'compact',
		name: '紧凑数字日期（YYYYMMDDHHmmss）',
		pattern: /^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})?(\d{2})?)?$/,
		parse: (match) => {
			const year = Number(match[1]);
			const month = Number(match[2]);
			const day = Number(match[3]);
			const hour = Number(match[4] ?? 0);
			const minute = Number(match[5] ?? 0);
			const second = Number(match[6] ?? 0);
			if (!inRange(year, month, day, hour, minute, second)) return null;
			return { wall: wallOf(year, month, day, hour, minute, second), note: '按 YYYYMMDDHHmmss 从左到右取值' };
		}
	},
	// 5. 英文月份：Jan 15, 2024 / January 15 2024 10:30 PM
	{
		id: 'en-month-first',
		name: '英文月份（月 日, 年）',
		pattern:
			/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?\s*(Z|UTC|GMT|UT)?$/i,
		parse: (match) => {
			const month = MONTH_NAMES[match[1].toLowerCase()];
			const day = Number(match[2]);
			const year = expandYear(Number(match[3]));
			const hour = to24Hour(Number(match[4] ?? 0), match[7] ?? undefined);
			const minute = Number(match[5] ?? 0);
			const second = Number(match[6] ?? 0);
			if (!month || !inRange(year, month, day, hour, minute, second)) return null;
			return { wall: wallOf(year, month, day, hour, minute, second), explicitOffset: parseZoneToken(match[8]) };
		}
	},
	// 6. 英文月份：15 Jan 2024
	{
		id: 'en-day-first',
		name: '英文月份（日 月 年）',
		pattern:
			/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{2,4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?\s*(Z|UTC|GMT|UT)?$/i,
		parse: (match) => {
			const day = Number(match[1]);
			const month = MONTH_NAMES[match[2].toLowerCase()];
			const year = expandYear(Number(match[3]));
			const hour = to24Hour(Number(match[4] ?? 0), match[7] ?? undefined);
			const minute = Number(match[5] ?? 0);
			const second = Number(match[6] ?? 0);
			if (!month || !inRange(year, month, day, hour, minute, second)) return null;
			return { wall: wallOf(year, month, day, hour, minute, second), explicitOffset: parseZoneToken(match[8]) };
		}
	},
	// 7. RFC 2822 / HTTP 日期：Mon, 15 Jan 2024 10:30:00 GMT / +0800
	{
		id: 'rfc2822',
		name: 'RFC 2822 / HTTP 日期',
		pattern:
			/^(?:[A-Za-z]{3},?\s+)?(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{4}|[A-Za-z]{2,4})?$/,
		parse: (match) => {
			const day = Number(match[1]);
			const month = MONTH_NAMES[match[2].toLowerCase()];
			const year = expandYear(Number(match[3]));
			const hour = Number(match[4]);
			const minute = Number(match[5]);
			const second = Number(match[6] ?? 0);
			if (!month || !inRange(year, month, day, hour, minute, second)) return null;
			return { wall: wallOf(year, month, day, hour, minute, second), explicitOffset: parseZoneToken(match[7]) };
		}
	},
	// 8. JS Date.toString 形态：Mon Jan 15 2024 10:30:00 GMT+0800
	{
		id: 'js-tostring',
		name: 'JavaScript Date 输出格式',
		pattern: /^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+GMT([+-]\d{4})$/,
		parse: (match) => {
			const month = MONTH_NAMES[match[1].toLowerCase()];
			const day = Number(match[2]);
			const year = Number(match[3]);
			const hour = Number(match[4]);
			const minute = Number(match[5]);
			const second = Number(match[6]);
			if (!month || !inRange(year, month, day, hour, minute, second)) return null;
			return {
				wall: wallOf(year, month, day, hour, minute, second),
				explicitOffset: parseZoneToken(match[7]),
				note: '由 new Date().toString() 产生'
			};
		}
	},
	// 9. 中文日期时间：2024年1月15日 10时30分00秒
	{
		id: 'chinese',
		name: '中文日期（年月日）',
		pattern: /^(\d{4})年(\d{1,2})月(\d{1,2})[日号](?:\s*(\d{1,2})\s*[时:点](\d{1,2})\s*分?(?::?(\d{1,2})\s*秒?)?)?$/,
		parse: (match) => {
			const year = Number(match[1]);
			const month = Number(match[2]);
			const day = Number(match[3]);
			const hour = Number(match[4] ?? 0);
			const minute = Number(match[5] ?? 0);
			const second = Number(match[6] ?? 0);
			if (!inRange(year, month, day, hour, minute, second)) return null;
			return { wall: wallOf(year, month, day, hour, minute, second) };
		}
	},
	// 10. 仅时间：10:30 / 10:30:00 / 10:30 PM（补当天日期）
	{
		id: 'time-only',
		name: '仅时间（补当天日期）',
		pattern: /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?\s*(AM|PM)?$/i,
		parse: (match, zone) => {
			const hour = to24Hour(Number(match[1]), match[5] ?? undefined);
			const minute = Number(match[2]);
			const second = Number(match[3] ?? 0);
			const milli = Number((match[4] ?? '0').padEnd(3, '0'));
			if (hour > 23 || !inRange(2000, 1, 1, hour, minute, second)) return null;
			const today = todayInZone(zone);
			return {
				wall: wallOf(today.year, today.month, today.day, hour, minute, second, milli),
				note: '未包含日期，按今天补全'
			};
		}
	},
	// 11. Unix 时间戳：秒 / 毫秒 / 微秒 / 纳秒
	{
		id: 'timestamp',
		name: 'Unix 时间戳',
		pattern: /^(\d{10}|\d{13}|\d{16}|\d{19})$/,
		parse: (match) => {
			const digits = match[1].length;
			const value = Number(match[1]);
			// 统一换算为毫秒：秒 ×1000，毫秒取原值，微秒 ÷1000，纳秒 ÷1e6
			const ms = digits === 10 ? value * 1000 : digits === 13 ? value : digits === 16 ? value / 1000 : value / 1e6;
			// 范围校验：1970-01-01 ~ 2100-01-01，越界则视为其他格式
			if (ms < 0 || ms > 4102444800000) return null;
			const date = new Date(ms);
			const unitText = digits === 10 ? '秒' : digits === 13 ? '毫秒' : digits === 16 ? '微秒' : '纳秒';
			return {
				wall: wallOf(
					date.getUTCFullYear(),
					date.getUTCMonth() + 1,
					date.getUTCDate(),
					date.getUTCHours(),
					date.getUTCMinutes(),
					date.getUTCSeconds(),
					date.getUTCMilliseconds()
				),
				explicitOffset: 0,
				note: `按 ${unitText}级时间戳解析（UTC）`
			};
		}
	}
];

/**
 * 识别并解析任意日期时间输入。
 * 命中规则后按输入时区（或输入自带的时区标记）换算为绝对时刻；全部规则均不匹配则返回异常提示。
 */
export function parseDateTimeInput(input: string, inputTimeZone: string): DateTimeParseResult {
	const raw = input.trim();
	if (!raw) return { ok: false, error: '' };

	for (const rule of PARSE_RULES) {
		const match = rule.pattern.exec(raw);
		if (!match) continue;
		const parsed: RuleParseResult | null = rule.parse(match, inputTimeZone);
		if (!parsed) continue;

		// 日历合法性校验（如 2024-02-30、25 点）
		if (!isCalendarValid(parsed.wall)) {
			return { ok: false, error: `日期不存在：${raw} 不是有效的日历时间，请检查月份天数与时间范围` };
		}

		const hasExplicit = parsed.explicitOffset !== undefined;
		const timestampMs = hasExplicit
			? Date.UTC(
					parsed.wall.year,
					parsed.wall.month - 1,
					parsed.wall.day,
					parsed.wall.hour,
					parsed.wall.minute,
					parsed.wall.second,
					parsed.wall.millisecond
				) -
				(parsed.explicitOffset as number) * 60000
			: zonedTimeToDate(parsed.wall, inputTimeZone).getTime();

		return {
			ok: true,
			value: {
				formatId: rule.id,
				formatName: rule.name,
				explicitZone: hasExplicit,
				zoneText: hasExplicit
					? parsed.explicitOffset === 0
						? 'UTC'
						: 'UTC' + formatOffset(parsed.explicitOffset as number)
					: '',
				timestampMs,
				note: parsed.note ?? ''
			}
		};
	}

	return {
		ok: false,
		error: `无法识别「${raw}」的日期格式，请参考支持的格式示例，或改用「2024-01-15 10:30:00」这类写法`
	};
}

/** 英文月份缩写与星期缩写（用于输出格式化） */
const MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

/** 相对当前时间的中文描述 */
export function formatRelative(targetMs: number, nowMs: number): string {
	const diff = targetMs - nowMs;
	const abs = Math.abs(diff);
	const units: [number, string][] = [
		[31536000000, '年'],
		[2592000000, '个月'],
		[604800000, '周'],
		[86400000, '天'],
		[3600000, '小时'],
		[60000, '分钟'],
		[1000, '秒']
	];
	if (abs < 1000) return '刚刚';
	for (const [unitMs, label] of units) {
		if (abs >= unitMs) {
			const value = Math.floor(abs / unitMs);
			return `${value} ${label}${diff < 0 ? '前' : '后'}`;
		}
	}
	return '刚刚';
}

/** 计算该时刻在目标时区的「当年第几天」 */
function getDayOfYear(parts: ZonedParts): number {
	const start = Date.UTC(parts.year, 0, 1);
	const current = Date.UTC(parts.year, parts.month - 1, parts.day);
	return Math.floor((current - start) / 86400000) + 1;
}

/** 计算该时刻在目标时区的 ISO 周数 */
function getIsoWeek(parts: ZonedParts): number {
	const target = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
	const dayNumber = (target.getUTCDay() + 6) % 7;
	target.setUTCDate(target.getUTCDate() - dayNumber + 3);
	const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
	const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
	firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);
	return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
}

/** 生成目标时区下带偏移的 ISO 8601 文本 */
function toIsoWithOffset(parts: ZonedParts, offsetMinutes: number): string {
	return (
		`${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}` +
		`.${pad(parts.millisecond, 3)}${formatOffset(offsetMinutes)}`
	);
}

/**
 * 由绝对时刻生成各常用格式的转换结果。
 * @param timestampMs 绝对时刻（UTC 毫秒）
 * @param timeZone 目标时区
 * @param nowMs 当前时刻（用于相对时间）
 */
export function buildDateFormats(timestampMs: number, timeZone: string, nowMs: number): DateFormatItem[] {
	const date = new Date(timestampMs);
	const parts = getZonedParts(date, timeZone);
	const utc = getZonedParts(date, 'UTC');
	const offset = getTimezoneOffsetMinutes(date, timeZone);
	const is12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
	const meridiem = parts.hour < 12 ? 'AM' : 'PM';
	const timeText = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
	const dateText = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;

	return [
		{ id: 'unix-sec', label: 'Unix 时间戳（秒）', value: String(Math.floor(timestampMs / 1000)), hint: '10 位' },
		{ id: 'unix-ms', label: 'Unix 时间戳（毫秒）', value: String(timestampMs), hint: '13 位' },
		{ id: 'iso-zone', label: 'ISO 8601（目标时区）', value: toIsoWithOffset(parts, offset), hint: timeZone },
		{ id: 'iso-utc', label: 'ISO 8601（UTC）', value: date.toISOString(), hint: 'UTC' },
		{
			id: 'datetime',
			label: '日期时间（目标时区）',
			value: `${dateText} ${timeText}`,
			hint: `${timeZone}（UTC${formatOffset(offset)}）`
		},
		{
			id: 'datetime-ms',
			label: '日期时间（含毫秒）',
			value: `${dateText} ${timeText}.${pad(parts.millisecond, 3)}`
		},
		{ id: 'date', label: '日期', value: dateText },
		{ id: 'date-slash', label: '日期（斜杠）', value: `${parts.year}/${pad(parts.month)}/${pad(parts.day)}` },
		{
			id: 'compact',
			label: '紧凑格式',
			value: `${parts.year}${pad(parts.month)}${pad(parts.day)}${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`
		},
		{ id: 'time', label: '时间（24 小时制）', value: timeText },
		{
			id: 'time-12',
			label: '时间（12 小时制）',
			value: `${pad(is12)}:${pad(parts.minute)}:${pad(parts.second)} ${meridiem}`
		},
		{
			id: 'chinese',
			label: '中文格式',
			value: `${parts.year}年${parts.month}月${parts.day}日 ${WEEKDAY_CN[parts.weekday]} ${timeText}`
		},
		{ id: 'weekday', label: '星期', value: `${WEEKDAY_CN[parts.weekday]}（${WEEKDAY_EN[parts.weekday]}）` },
		{
			id: 'rfc2822',
			label: 'RFC 2822',
			value: `${WEEKDAY_EN[parts.weekday]}, ${pad(parts.day)} ${MONTH_EN[parts.month - 1]} ${parts.year} ${timeText} ${formatOffset(offset).replace(':', '')}`
		},
		{
			id: 'http-date',
			label: 'HTTP 日期（RFC 7231）',
			value: `${WEEKDAY_EN[utc.weekday]}, ${pad(utc.day)} ${MONTH_EN[utc.month - 1]} ${utc.year} ${pad(utc.hour)}:${pad(utc.minute)}:${pad(utc.second)} GMT`,
			hint: '始终为 GMT'
		},
		{
			id: 'utc-datetime',
			label: 'UTC 日期时间',
			value: `${utc.year}-${pad(utc.month)}-${pad(utc.day)} ${pad(utc.hour)}:${pad(utc.minute)}:${pad(utc.second)}`
		},
		{ id: 'relative', label: '相对当前时间', value: formatRelative(timestampMs, nowMs) },
		{ id: 'day-of-year', label: '当年第几天', value: `第 ${getDayOfYear(parts)} 天` },
		{ id: 'week-of-year', label: 'ISO 周数', value: `第 ${getIsoWeek(parts)} 周` },
		{
			id: 'zone-info',
			label: '目标时区信息',
			value: `${timeZone}（UTC${formatOffset(offset)}）`,
			hint: '该时刻在此偏移下'
		}
	];
}
