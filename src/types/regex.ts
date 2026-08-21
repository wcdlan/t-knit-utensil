// 正则测试工具相关类型

/** 单次匹配结果 */
export interface RegexMatch {
	match: string;
	index: number;
	groups: string[];
}

/** 常用正则模板 */
export interface CommonPattern {
	label: string;
	pattern: string;
}

/** 特殊字符速查表中的一组字符说明 */
export interface CharGroup {
	title: string;
	items: { char: string; desc: string }[];
}
