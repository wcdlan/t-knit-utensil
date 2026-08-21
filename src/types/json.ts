// JSON 工具相关类型

/** 随机 JSON 生成模式 */
export type JsonGenMode = 'basic' | 'rich' | 'compact' | 'array' | 'deep';

/** 随机 JSON 生成模式选项（含展示用元信息） */
export interface JsonGenModeOption {
	value: JsonGenMode;
	label: string;
	description: string;
}
