// RAID 存储计算器相关类型（磁盘容量 / 阵列等级 / 热备）

/** 磁盘容量单位（TB/GB 为十进制，TiB/GiB 为二进制） */
export type RaidDiskUnit = 'TB' | 'GB' | 'TiB' | 'GiB';

/** RAID 等级标识 */
export type RaidLevelId =
	| 'jbod'
	| 'raid0'
	| 'raid1'
	| 'raid1e'
	| 'raid3'
	| 'raid4'
	| 'raid5'
	| 'raid5e'
	| 'raid5ee'
	| 'raid6'
	| 'raid6e'
	| 'raidtp'
	| 'raid10'
	| 'raid01'
	| 'raid50'
	| 'raid51'
	| 'raid60'
	| 'raid61'
	| 'shr'
	| 'shr2';

/** RAID 等级分类（用于分组展示与图标着色） */
export type RaidCategory = 'span' | 'stripe' | 'mirror' | 'parity' | 'nested' | 'hybrid';

/** 热备盘作用范围：全局热备（可服务多个阵列）/ 专用热备（仅服务当前阵列） */
export type RaidSpareScope = 'global' | 'dedicated';

/** RAID 等级元信息（静态描述，不含具体磁盘数量） */
export interface RaidLevelMeta {
	/** 等级标识 */
	id: RaidLevelId;
	/** 等级名称（如 RAID 5） */
	name: string;
	/** 别名 / 俗称（如 分布式奇偶校验） */
	alias: string;
	/** 分类 */
	category: RaidCategory;
	/** 最少阵列磁盘数（不含热备） */
	minDisks: number;
	/** 阵列磁盘数是否必须为偶数 */
	evenOnly?: boolean;
	/** 是否需要配置子组磁盘数（RAID 50/60 等嵌套等级） */
	needsSpan?: boolean;
	/** 子组最少磁盘数 */
	minSpanDisks?: number;
	/** 读性能说明 */
	readPerf: string;
	/** 写性能说明 */
	writePerf: string;
	/** 一句话说明（选择列表中展示） */
	summary: string;
}

/** 容量值（字节数 + 十进制 / 二进制展示文案） */
export interface RaidCapacity {
	/** 字节数（原始值，供占比计算） */
	bytes: number;
	/** 十进制展示（如 24.00 TB） */
	decimal: string;
	/** 二进制展示（如 21.82 TiB） */
	binary: string;
}

/** 单个 RAID 等级的计算结果 */
export interface RaidCalcResult {
	/** 等级标识 */
	level: RaidLevelId;
	/** 等级名称 */
	name: string;
	/** 分类 */
	category: RaidCategory;
	/** 是否满足该等级的磁盘数量要求 */
	valid: boolean;
	/** 不满足要求时的原因（valid 为 true 时为空串） */
	reason: string;
	/** 阵列磁盘数（不含热备） */
	arrayDisks: number;
	/** 数据盘数量 */
	dataDisks: number;
	/** 冗余盘数量（校验盘 + 带内热备空间） */
	parityDisks: number;
	/** 子组数量（嵌套等级为子组数，其余为 1） */
	spans: number;
	/** 每组磁盘数 */
	spanDisks: number;
	/** 阵列原始容量（阵列磁盘数 × 单盘容量） */
	raw: RaidCapacity;
	/** 可用容量（valid 为 false 时为 0） */
	usable: RaidCapacity;
	/** 冗余开销容量（原始容量 - 可用容量） */
	overhead: RaidCapacity;
	/** 容量利用率（可用容量 / 原始容量，0-1） */
	efficiency: number;
	/** 可同时损坏的磁盘数 */
	faultTolerance: number;
	/** 容错能力描述 */
	faultText: string;
	/** 读性能说明 */
	readPerf: string;
	/** 写性能说明 */
	writePerf: string;
}

/** 计算器输入 */
export interface RaidCalcInput {
	/** 单盘容量数值 */
	diskSize: number;
	/** 单盘容量单位 */
	diskUnit: RaidDiskUnit;
	/** 总磁盘数（含热备盘） */
	diskCount: number;
	/** 热备盘数量 */
	hotSpareCount: number;
	/** 热备盘作用范围 */
	spareScope: RaidSpareScope;
	/** 子组磁盘数（仅嵌套等级使用） */
	spanDisks: number;
}

/** 磁盘角色分解（各等级内部计算使用） */
export interface RaidDiskShape {
	/** 数据盘数量 */
	dataDisks: number;
	/** 冗余盘数量（校验盘 + 带内热备空间） */
	parityDisks: number;
	/** 子组数量 */
	spans: number;
	/** 每组磁盘数 */
	spanDisks: number;
	/** 可同时损坏的磁盘数 */
	faultTolerance: number;
	/** 参与可用容量的磁盘数（可用容量 = 该值 × 单盘容量） */
	usableDisks: number;
}

/** 容量构成条的分段（相对总物理容量） */
export interface RaidCapacitySegment {
	/** 分段标识 */
	key: string;
	/** 分段名称 */
	label: string;
	/** 分段容量展示文案 */
	value: string;
	/** 占比（0-1） */
	ratio: number;
	/** 分段颜色（Tailwind 背景类，如 bg-blue-500） */
	color: string;
}

/** 磁盘数量快捷预设 */
export interface RaidDiskPreset {
	/** 磁盘数量 */
	count: number;
	/** 说明（常见机型 / 场景） */
	hint: string;
}

/** 磁盘容量单位下拉选项 */
export interface RaidDiskUnitOption {
	/** 下拉选项文案（如 TB） */
	label: string;
	/** 单位标识 */
	value: RaidDiskUnit;
	/** 进制说明（如 十进制 10¹²） */
	hint: string;
}

/** 硬盘接口标识 */
export type RaidInterfaceId = 'sata2' | 'sata3' | 'sas12' | 'sas24' | 'nvme3' | 'nvme4' | 'nvme5';

/** 硬盘接口与链路规格（带宽单位 MB/s） */
export interface RaidInterface {
	/** 接口标识 */
	id: RaidInterfaceId;
	/** 接口名称（如 SATA 6 Gb/s） */
	name: string;
	/** 常见形态（如 SATA III） */
	alias: string;
	/** 链路理论带宽（MB/s） */
	linkSpeed: number;
	/** 单盘实测顺序带宽（MB/s，典型值） */
	effectiveSpeed: number;
	/** 适用场景说明 */
	hint: string;
}
