// 时间日期转换器相关类型

/** 墙上时间：不含时区语义的「年月日时分秒毫秒」 */
export interface WallClock {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	millisecond: number;
}

/** 某一时刻在指定时区下的墙上时间（附带星期） */
export interface ZonedParts extends WallClock {
	/** 星期索引：0 = 周日，1 = 周一 …… 6 = 周六 */
	weekday: number;
}

/** 解析成功的结果 */
export interface DateTimeParseSuccess {
	/** 命中的格式 id */
	formatId: string;
	/** 命中的格式名称（如「ISO 8601」） */
	formatName: string;
	/** 输入中是否显式携带时区信息 */
	explicitZone: boolean;
	/** 显式时区描述（如 UTC+08:00），无则空串 */
	zoneText: string;
	/** 解析出的绝对时刻（UTC 毫秒） */
	timestampMs: number;
	/** 识别说明（如「按 月/日/年 解释」） */
	note: string;
}

/** 解析结果：成功返回数据，失败返回异常提示 */
export type DateTimeParseResult = { ok: true; value: DateTimeParseSuccess } | { ok: false; error: string };

/** 一种输出格式的转换结果 */
export interface DateFormatItem {
	/** 格式标识 */
	id: string;
	/** 格式名称（如「Unix 时间戳（秒）」） */
	label: string;
	/** 转换结果 */
	value: string;
	/** 补充说明 */
	hint?: string;
}

/** 时区下拉选项 */
export interface TimezoneOption {
	label: string;
	value: string;
}

/** 解析规则命中后返回的中间结果 */
export interface RuleParseResult {
	/** 墙上时间 */
	wall: WallClock;
	/** 输入显式声明的时区偏移（分钟，东为正）；未声明则 undefined */
	explicitOffset?: number;
	/** 识别补充说明 */
	note?: string;
}

/**
 * 一条日期解析规则。
 * parse 返回 null 表示「数字超出取值范围，不适用于本规则」，交由后续规则继续尝试。
 */
export interface ParseRule {
	id: string;
	name: string;
	pattern: RegExp;
	parse: (match: RegExpExecArray, inputTimeZone: string) => RuleParseResult | null;
}
