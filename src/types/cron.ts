// Cron 表达式工具相关类型

/** cron 表达式字段类型：秒 / 分 / 时 / 日 / 月 / 周 / 年 */
export type CronFieldType = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'week' | 'year';

/** cron 表达式的书写风格：5 段标准式 / 6 段带秒式 / 7 段带年式 / 别名（@daily 等）/ 间隔式（@every 5m） */
export type CronSyntaxKind = 'standard' | 'withSeconds' | 'withYear' | 'alias' | 'every';

/** 单段解析后的语义种类 */
export type CronFieldKind = 'any' | 'value' | 'range' | 'list' | 'step' | 'lastDay' | 'nearestWeekday' | 'nthWeekday';

/** 字段描述面板中的一条明细 */
export interface CronFieldDetail {
	/** 字段类型 */
	type: CronFieldType;
	/** 字段中文名（如「分钟」） */
	label: string;
	/** 表达式中的原始片段（如 `*&#47;15`、`MON-FRI`） */
	token: string;
	/** 匹配值数量；`lastDay` / `nearestWeekday` 等动态规则为 null */
	count: number;
	/** 可枚举字段的匹配值文本（如 `0, 15, 30, 45`），动态规则为 null */
	valuesText: string | null;
	/** 该字段的中文语义描述 */
	description: string;
}

/** cron 表达式解析结果 */
export interface CronParseResult {
	/** 是否解析成功 */
	ok: boolean;
	/** 错误信息列表（ok 为 false 时非空） */
	errors: string[];
	/** 归一化后的表达式（逗号后统一补空格、别名展开前保留原样） */
	normalized: string;
	/** 书写风格 */
	syntax: CronSyntaxKind;
	/** 是否包含秒字段 */
	hasSeconds: boolean;
	/** 是否包含年字段 */
	hasYear: boolean;
	/** 遇到的别名（如 `@daily`） */
	alias: string | null;
	/** 完整中文描述 */
	description: string;
	/** 各字段描述明细 */
	fields: CronFieldDetail[];
}

/** 下一次执行时间条目 */
export interface CronRunItem {
	/** 序号（从 1 开始） */
	index: number;
	/** 时间戳（毫秒） */
	timestampMs: number;
	/** 本地时间文本（yyyy-MM-dd HH:mm:ss） */
	localText: string;
	/** UTC 时间文本（yyyy-MM-dd HH:mm:ss） */
	utcText: string;
	/** 相对当前时间的中文描述（如「3 分钟后」） */
	relative: string;
}

/** 执行时间预览结果 */
export interface CronPreviewResult {
	/** 预览条目列表 */
	items: CronRunItem[];
	/** 剩余多少次未生成（达到扫描上限时大于 0） */
	remaining: number;
}

/** 常用 cron 表达式条目 */
export interface CronPreset {
	/** 表达式 */
	expression: string;
	/** 名称 */
	name: string;
	/** 分组名（分页标签） */
	category: string;
	/** 用途说明 */
	description: string;
}

/** 编辑器中可插入的占位符 */
export interface CronPlaceholder {
	/** 插入文本 */
	text: string;
	/** 按钮名称 */
	label: string;
	/** 语义说明 */
	hint: string;
}

/** 字段编辑器（构建器）选择值变化事件 */
export interface CronBuilderSelectEvent {
	/** 字段类型 */
	type: CronFieldType;
	/** 字段分片下标（含秒表达式时 minute 为 1） */
	index: number;
	/** 选择后的表达式片段 */
	token: string;
}

/** 字段编辑器（构建器）自定义输入变化事件 */
export interface CronBuilderInputEvent {
	/** 字段类型 */
	type: CronFieldType;
	/** 字段分片下标 */
	index: number;
	/** 自定义表达式片段文本 */
	raw: string;
}

/** 字段编辑器所需的最小解析信息：仅关心各字段原始片段与是否含秒 */
export interface CronBuilderContext {
	/** 归一化后的表达式 */
	expression: string;
	/** 各字段分片 */
	tokens: string[];
	/** 各分片对应的字段类型 */
	types: CronFieldType[];
	/** 是否包含秒字段 */
	hasSeconds: boolean;
	/** 表达式是否可解析（解析失败时不允许改写） */
	ok: boolean;
}

/** 字段编辑器中的单个字段选项 */
export interface CronBuilderOption {
	/** 选项名称 */
	label: string;
	/** 选择后生成的表达式片段 */
	value: string;
}

/** 字段编辑器中的单个字段配置 */
export interface CronBuilderField {
	/** 字段类型 */
	type: CronFieldType;
	/** 字段中文名 */
	label: string;
	/** 字段分片下标 */
	index: number;
	/** 当前分片文本 */
	token: string;
	/** 当前分片命中的选项值（未命中为 null，表示需要自定义输入） */
	selected: string | null;
	/** 快捷选项列表 */
	options: CronBuilderOption[];
	/** 字段取值范围提示 */
	rangeHint: string;
}
