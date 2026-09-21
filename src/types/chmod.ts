// chmod 权限计算相关类型（权限作用对象 / 权限位 / 特殊位 / 预设 / 解析结果）

/** 权限作用对象标识：文件所有者 / 所属用户组 / 其他用户 */
export type ChmodClassId = 'owner' | 'group' | 'other';

/** 基本权限位标识 */
export type ChmodBitId = 'read' | 'write' | 'execute';

/** 特殊权限位标识 */
export type ChmodSpecialId = 'setuid' | 'setgid' | 'sticky';

/** 常用权限预设分类 */
export type ChmodPresetCategory = 'file' | 'dir' | 'special';

/** 权限作用对象元信息 */
export interface ChmodClassMeta {
	/** 对象标识 */
	id: ChmodClassId;
	/** 中文名称 */
	name: string;
	/** 符号表示中的字母（u / g / o） */
	letter: string;
	/** 在八进制中的位移（所有者 6 位、组 3 位、其他 0 位） */
	shift: number;
	/** 说明 */
	hint: string;
}

/** 基本权限位元信息 */
export interface ChmodBitMeta {
	/** 权限位标识 */
	id: ChmodBitId;
	/** 中文名称 */
	name: string;
	/** 符号字母（r / w / x） */
	letter: string;
	/** 对应数值（4 / 2 / 1） */
	value: number;
	/** 说明 */
	hint: string;
}

/** 特殊权限位元信息 */
export interface ChmodSpecialMeta {
	/** 特殊位标识 */
	id: ChmodSpecialId;
	/** 名称（setuid / setgid / sticky） */
	name: string;
	/** 符号字母（s / t） */
	letter: string;
	/** 对应数值 */
	value: number;
	/** 八进制中的前缀数字（4 / 2 / 1） */
	octalDigit: number;
	/** 说明 */
	hint: string;
}

/** 常用权限预设 */
export interface ChmodPreset {
	/** 八进制表示（不含前导 0，含特殊位时为 4 位） */
	octal: string;
	/** 分类 */
	category: ChmodPresetCategory;
	/** 权限说明 */
	description: string;
	/** 典型使用场景 */
	usage: string;
}

/** 单个作用对象的权限拆解行（结果区展示） */
export interface ChmodExplainRow {
	/** 作用对象名称 */
	label: string;
	/** 该对象的八进制数字（0 ~ 7） */
	digit: number;
	/** 该对象的符号表示（3 位，如 rwx） */
	symbolic: string;
	/** 数值拆解（如 4 + 2 + 1 = 7） */
	formula: string;
	/** 中文权限描述 */
	description: string;
}

/** 八进制 / 符号输入解析结果 */
export interface ChmodParseResult {
	/** 是否解析成功 */
	ok: boolean;
	/** 解析出的权限值（0 ~ 0o7777），失败时为 0 */
	mode: number;
	/** 失败原因 */
	error?: string;
}
