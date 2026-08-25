// 字数统计工具相关类型

/** 文本统计结果 */
export interface WordCountStats {
	/** 总字符数 */
	chars: number;
	/** 字符数（无空格） */
	charsNoSpace: number;
	/** 单词数 */
	words: number;
	/** 行数 */
	lines: number;
	/** 段落数 */
	paragraphs: number;
	/** 字节数（UTF-8） */
	bytes: number;
	/** 中文字符数 */
	chineseChars: number;
	/** 数字组数 */
	numbers: number;
}
