// 文件大小转换：容量单位定义、字节 / 比特换算与文本格式化

import type {
	FileSizeBase,
	FileSizeMagnitude,
	FileSizeMagnitudeMeta,
	FileSizeReferenceRow,
	FileSizeRow,
	FileSizeSummaryItem,
	FileSizeUnitId,
	FileSizeUnitMeta
} from '@/types/filesize';

/** 全部容量单位（bit / B 为基本单位，其余为 1000 进制与 1024 进制两套） */
export const FILE_SIZE_UNITS: FileSizeUnitMeta[] = [
	{
		id: 'bit',
		magnitude: 'bit',
		symbol: 'bit',
		name: '比特',
		base: 1000,
		bits: true,
		exponent: 0,
		hint: '最小数据单位，1 字节 = 8 比特'
	},
	{
		id: 'B',
		magnitude: 'B',
		symbol: 'B',
		name: '字节',
		base: 1000,
		bits: false,
		exponent: 0,
		hint: '存储的基本单位，1 B = 8 bit'
	},
	{ id: 'KB', magnitude: 'K', symbol: 'KB', name: '千字节', base: 1000, bits: false, exponent: 1, hint: '10³ 字节' },
	{ id: 'MB', magnitude: 'M', symbol: 'MB', name: '兆字节', base: 1000, bits: false, exponent: 2, hint: '10⁶ 字节' },
	{
		id: 'GB',
		magnitude: 'G',
		symbol: 'GB',
		name: '吉字节',
		base: 1000,
		bits: false,
		exponent: 3,
		hint: '10⁹ 字节，硬盘与网络标称常用'
	},
	{ id: 'TB', magnitude: 'T', symbol: 'TB', name: '太字节', base: 1000, bits: false, exponent: 4, hint: '10¹² 字节' },
	{ id: 'PB', magnitude: 'P', symbol: 'PB', name: '拍字节', base: 1000, bits: false, exponent: 5, hint: '10¹⁵ 字节' },
	{ id: 'EB', magnitude: 'E', symbol: 'EB', name: '艾字节', base: 1000, bits: false, exponent: 6, hint: '10¹⁸ 字节' },
	{
		id: 'KiB',
		magnitude: 'K',
		symbol: 'KiB',
		name: '千字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 1,
		hint: '2¹⁰ = 1024 字节'
	},
	{
		id: 'MiB',
		magnitude: 'M',
		symbol: 'MiB',
		name: '兆字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 2,
		hint: '2²⁰ 字节'
	},
	{
		id: 'GiB',
		magnitude: 'G',
		symbol: 'GiB',
		name: '吉字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 3,
		hint: '2³⁰ 字节，操作系统显示常用'
	},
	{
		id: 'TiB',
		magnitude: 'T',
		symbol: 'TiB',
		name: '太字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 4,
		hint: '2⁴⁰ 字节'
	},
	{
		id: 'PiB',
		magnitude: 'P',
		symbol: 'PiB',
		name: '拍字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 5,
		hint: '2⁵⁰ 字节'
	},
	{
		id: 'EiB',
		magnitude: 'E',
		symbol: 'EiB',
		name: '艾字节（二进制）',
		base: 1024,
		bits: false,
		exponent: 6,
		hint: '2⁶⁰ 字节'
	}
];

/** 各量级元信息（单位单选与量级换算表的数据源） */
export const FILE_SIZE_MAGNITUDES: FileSizeMagnitudeMeta[] = [
	{ magnitude: 'bit', label: '比特', decimalId: 'bit', binaryId: 'bit' },
	{ magnitude: 'B', label: '字节', decimalId: 'B', binaryId: 'B' },
	{ magnitude: 'K', label: '千', decimalId: 'KB', binaryId: 'KiB' },
	{ magnitude: 'M', label: '兆', decimalId: 'MB', binaryId: 'MiB' },
	{ magnitude: 'G', label: '吉', decimalId: 'GB', binaryId: 'GiB' },
	{ magnitude: 'T', label: '太', decimalId: 'TB', binaryId: 'TiB' },
	{ magnitude: 'P', label: '拍', decimalId: 'PB', binaryId: 'PiB' },
	{ magnitude: 'E', label: '艾', decimalId: 'EB', binaryId: 'EiB' }
];

/** 十进制（1000 进制）单位按幂次从大到小（用于挑选最简表示） */
const DECIMAL_DESC = FILE_SIZE_UNITS.filter((unit) => !unit.bits && unit.base === 1000).sort(
	(a, b) => b.exponent - a.exponent
);
/** 二进制（1024 进制）单位按幂次从大到小（用于挑选最简表示） */
const BINARY_DESC = FILE_SIZE_UNITS.filter((unit) => !unit.bits && unit.base === 1024).sort(
	(a, b) => b.exponent - a.exponent
);

/** 按标识取单位元信息（未命中时回退到字节） */
export function getUnit(id: FileSizeUnitId): FileSizeUnitMeta {
	return FILE_SIZE_UNITS.find((unit) => unit.id === id) ?? FILE_SIZE_UNITS[1];
}

/** 按标识取量级元信息（未命中时回退到字节量级） */
export function getMagnitude(id: FileSizeUnitId): FileSizeMagnitudeMeta {
	return FILE_SIZE_MAGNITUDES.find((item) => item.decimalId === id || item.binaryId === id) ?? FILE_SIZE_MAGNITUDES[1];
}

/** 由「量级 + 换算标准」解析出具体单位标识（bit / B 与进制无关） */
export function resolveUnitId(magnitude: FileSizeMagnitude, base: FileSizeBase): FileSizeUnitId {
	const meta = FILE_SIZE_MAGNITUDES.find((item) => item.magnitude === magnitude) ?? FILE_SIZE_MAGNITUDES[1];
	return base === 1000 ? meta.decimalId : meta.binaryId;
}

/** 单位对应的比特数（1 KB = 8000 bit，1 KiB = 8192 bit） */
export function unitToBits(unit: FileSizeUnitMeta): number {
	return (unit.bits ? 1 : 8) * unit.base ** unit.exponent;
}

/** 把「数值 + 单位」换算为比特总数 */
export function toBits(amount: number, unitId: FileSizeUnitId): number {
	return amount * unitToBits(getUnit(unitId));
}

/** 数值格式化：常规值加千分位，极小 / 极大值改用科学计数法 */
export function formatNumber(value: number, precision: number): string {
	if (!Number.isFinite(value)) return '—';
	if (value === 0) return '0';
	const digits = Math.min(Math.max(precision, 0), 10);
	const abs = Math.abs(value);
	if (abs < 1e-4 || abs >= 1e21) return value.toExponential(Math.max(1, digits));
	return value.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/** 按指定单位格式化比特总数 */
export function formatUnitValue(bits: number, unitId: FileSizeUnitId, precision: number): string {
	return formatNumber(bits / unitToBits(getUnit(unitId)), precision);
}

/** 按指定进制挑选最大可读单位（如 1.05 GB / 1 GiB），不足 1 字节时退回比特 */
export function formatBest(bits: number, base: FileSizeBase, precision: number): string {
	const units = base === 1000 ? DECIMAL_DESC : BINARY_DESC;
	for (const unit of units) {
		const value = bits / unitToBits(unit);
		if (Math.abs(value) >= 1) return `${formatNumber(value, precision)} ${unit.symbol}`;
	}
	return `${formatNumber(bits, precision)} bit`;
}

/** 构造量级换算表（十进制 / 二进制两列对照） */
export function buildRows(bits: number, precision: number): FileSizeRow[] {
	return FILE_SIZE_MAGNITUDES.map((item) => {
		const decimalUnit = getUnit(item.decimalId);
		const binaryUnit = getUnit(item.binaryId);
		return {
			label: item.label,
			decimalId: item.decimalId,
			binaryId: item.binaryId,
			decimalUnit: decimalUnit.symbol,
			binaryUnit: binaryUnit.symbol,
			decimal: formatUnitValue(bits, item.decimalId, precision),
			binary: formatUnitValue(bits, item.binaryId, precision)
		};
	});
}

/** 构造基准值摘要（字节 / 比特 / 两种进制的最简表示） */
export function buildSummary(bits: number, precision: number): FileSizeSummaryItem[] {
	return [
		{ label: '字节（B）', value: formatNumber(bits / 8, precision), hint: '存储的基本单位', mono: true },
		{ label: '比特（bit）', value: formatNumber(bits, precision), hint: '1 字节 = 8 比特', mono: true },
		{ label: '十进制最简表示', value: formatBest(bits, 1000, precision), hint: '按 1000 进制取最大可读单位' },
		{ label: '二进制最简表示', value: formatBest(bits, 1024, precision), hint: '按 1024 进制取最大可读单位' }
	];
}

/** 构造硬盘标称容量对照表（厂商按 1000 进制标称，系统按 1024 进制显示） */
export function buildReferenceRows(): FileSizeReferenceRow[] {
	const sizes: { label: string; bytes: number }[] = [
		{ label: '128 GB', bytes: 128e9 },
		{ label: '256 GB', bytes: 256e9 },
		{ label: '512 GB', bytes: 512e9 },
		{ label: '1 TB', bytes: 1e12 },
		{ label: '2 TB', bytes: 2e12 },
		{ label: '4 TB', bytes: 4e12 },
		{ label: '8 TB', bytes: 8e12 },
		{ label: '16 TB', bytes: 16e12 }
	];
	return sizes.map((item) => {
		const gib = item.bytes / 1024 ** 3;
		return {
			label: item.label,
			bytes: formatNumber(item.bytes, 0),
			binary: gib >= 1024 ? `${(gib / 1024).toFixed(2)} TiB` : `${gib.toFixed(2)} GiB`
		};
	});
}

/** 构造复制全部用的纯文本（制表符分隔，便于粘贴到表格软件） */
export function buildRowsText(rows: FileSizeRow[], inputText: string): string {
	const header = `文件大小换算（${inputText}）`;
	const columns = ['量级', '十进制（1000）', '二进制（1024）'].join('\t');
	const body = rows.map((row) =>
		[
			row.label,
			`${row.decimal} ${row.decimalUnit}`,
			row.binaryId === row.decimalId ? '—' : `${row.binary} ${row.binaryUnit}`
		].join('\t')
	);
	return [header, columns, ...body].join('\n');
}
