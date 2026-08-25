/**
 * JS 混淆工具类型定义
 */

/** 混淆预设类型（对应 javascript-obfuscator 的 optionsPreset 枚举） */
export type ObfuscationPresetKey = 'default' | 'low-obfuscation' | 'medium-obfuscation' | 'high-obfuscation';

/** 混淆选项的控件类型 */
export type ObfuscatorOptionType = 'boolean' | 'number' | 'string' | 'select' | 'multi-select' | 'string-array';

/** 选项控件可选项（select / multi-select 使用） */
export interface ObfuscatorSelectOption {
	label: string;
	value: string;
}

/** 单个混淆选项的元数据描述（驱动表单渲染） */
export interface ObfuscatorOptionMeta {
	/** 选项名（对应 javascript-obfuscator 选项 key） */
	key: string;
	/** 中文显示名 */
	label: string;
	/** 中文说明 */
	description: string;
	/** 控件类型 */
	type: ObfuscatorOptionType;
	/** 可选项（select / multi-select） */
	options?: ObfuscatorSelectOption[];
	/** 数值范围与步进（number） */
	min?: number;
	max?: number;
	step?: number;
	/** 输入占位提示 */
	placeholder?: string;
}

/** 选项分组 */
export interface ObfuscatorOptionGroup {
	id: string;
	name: string;
	options: ObfuscatorOptionMeta[];
}

/** 混淆预设定义 */
export interface ObfuscationPreset {
	key: ObfuscationPresetKey;
	name: string;
	description: string;
	/** 相对 default 预设的覆盖项 */
	overrides: Partial<ObfuscatorOptions>;
}

/** 传给 javascript-obfuscator 的最终选项对象 */
export type ObfuscatorOptions = Record<string, string | number | boolean | string[]>;

/** 混淆执行结果 */
export interface ObfuscationResult {
	/** 混淆后的代码 */
	code: string;
	/** 混淆耗时（毫秒） */
	durationMs: number;
}
