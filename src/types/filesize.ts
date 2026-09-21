// 文件大小转换相关类型（容量单位 / 换算标准 / 换算结果 / 量级）

/** 换算标准：十进制（1000，KB/MB/GB）或二进制（1024，KiB/MiB/GiB） */
export type FileSizeBase = 1000 | 1024;

/** 容量量级标识（比特 / 字节 / 千 / 兆 / 吉 / 太 / 拍 / 艾） */
export type FileSizeMagnitude = 'bit' | 'B' | 'K' | 'M' | 'G' | 'T' | 'P' | 'E';

/** 容量单位标识 */
export type FileSizeUnitId =
	'bit' | 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB';

/** 容量单位元信息 */
export interface FileSizeUnitMeta {
	/** 单位标识 */
	id: FileSizeUnitId;
	/** 所属量级 */
	magnitude: FileSizeMagnitude;
	/** 单位符号（如 KB / KiB） */
	symbol: string;
	/** 中文名称 */
	name: string;
	/** 所属换算标准 */
	base: FileSizeBase;
	/** 是否为比特单位 */
	bits: boolean;
	/** 相对基本单位（字节 / 比特）的幂次 */
	exponent: number;
	/** 说明 */
	hint: string;
}

/** 量级元信息（同一量级对应十进制与二进制两个单位标识） */
export interface FileSizeMagnitudeMeta {
	/** 量级标识 */
	magnitude: FileSizeMagnitude;
	/** 量级名称（比特 / 字节 / 千 / 兆 …） */
	label: string;
	/** 十进制单位标识 */
	decimalId: FileSizeUnitId;
	/** 二进制单位标识 */
	binaryId: FileSizeUnitId;
}

/** 量级换算行（每个量级一行，十进制 / 二进制两列对照） */
export interface FileSizeRow {
	/** 量级名称（比特 / 字节 / 千 / 兆 …） */
	label: string;
	/** 十进制单位标识 */
	decimalId: FileSizeUnitId;
	/** 二进制单位标识 */
	binaryId: FileSizeUnitId;
	/** 十进制单位符号 */
	decimalUnit: string;
	/** 二进制单位符号 */
	binaryUnit: string;
	/** 十进制换算结果文本 */
	decimal: string;
	/** 二进制换算结果文本 */
	binary: string;
}

/** 摘要指标行（基准值展示，点击可复制） */
export interface FileSizeSummaryItem {
	/** 指标名称 */
	label: string;
	/** 指标值 */
	value: string;
	/** 补充说明 */
	hint?: string;
	/** 是否使用等宽字体 */
	mono?: boolean;
}

/** 标称容量对照行（硬盘标称容量在系统中的显示值） */
export interface FileSizeReferenceRow {
	/** 标称容量（如 1 TB） */
	label: string;
	/** 精确字节数 */
	bytes: string;
	/** 系统（二进制）显示值 */
	binary: string;
}
