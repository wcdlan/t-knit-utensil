// 变量名格式转换工具相关类型

/** 变量名格式标识 */
export type CaseFormatId =
	'camel' | 'pascal' | 'snake' | 'constant' | 'kebab' | 'train' | 'dot' | 'lower' | 'upper' | 'sentence' | 'title';

/** 变量名格式定义（含单词数组到该格式的转换函数） */
export interface CaseFormat {
	id: CaseFormatId;
	/** 格式名称，如 camelCase */
	name: string;
	/** 中文格式说明 */
	description: string;
	/** 由拆分后的单词数组生成该格式的变量名 */
	convert: (words: string[]) => string;
}

/** 单个格式的转换结果 */
export interface CaseResult {
	format: CaseFormat;
	value: string;
}
