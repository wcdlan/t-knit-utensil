// RAID 存储计算器：等级元信息、容量换算与阵列容量 / 容错计算

import type {
	RaidCalcInput,
	RaidCalcResult,
	RaidCapacity,
	RaidCategory,
	RaidDiskPreset,
	RaidDiskShape,
	RaidDiskSpeedPreset,
	RaidDiskUnit,
	RaidDiskUnitOption,
	RaidInterface,
	RaidInterfaceId,
	RaidLevelId,
	RaidLevelMeta,
	RaidSpeedBottleneck,
	RaidSpeedLimit
} from '@/types/raid';

/** 各容量单位对应的字节数（TB/GB 为十进制，TiB/GiB 为二进制） */
const UNIT_BYTES: Record<RaidDiskUnit, number> = {
	TB: 1e12,
	GB: 1e9,
	TiB: 1024 ** 4,
	GiB: 1024 ** 3
};

/** 磁盘容量单位选项（下拉框数据源，label 保持简短避免下拉宽度过大） */
export const DISK_UNIT_OPTIONS: RaidDiskUnitOption[] = [
	{ label: 'TB', value: 'TB', hint: '十进制 10¹²' },
	{ label: 'GB', value: 'GB', hint: '十进制 10⁹' },
	{ label: 'TiB', value: 'TiB', hint: '二进制 2⁴⁰' },
	{ label: 'GiB', value: 'GiB', hint: '二进制 2³⁰' }
];

/** 等级分类名称 */
export const RAID_CATEGORY_LABELS: Record<RaidCategory, string> = {
	span: '线性叠加',
	stripe: '纯条带（无冗余）',
	mirror: '镜像冗余',
	parity: '校验冗余',
	nested: '嵌套阵列',
	hybrid: '混合 / 厂商私有'
};

/** 等级分类展示顺序 */
export const RAID_CATEGORY_ORDER: RaidCategory[] = ['span', 'stripe', 'mirror', 'parity', 'nested', 'hybrid'];

/** 等级分类对应的标签类型（选择卡片与对比表徽标） */
export const RAID_CATEGORY_TAG_TYPES = {
	span: 'default',
	stripe: 'warning',
	mirror: 'success',
	parity: 'info',
	nested: 'primary',
	hybrid: 'warning'
} as const;

/** 磁盘数量快捷预设（常见盘位机型） */
export const DISK_COUNT_PRESETS: RaidDiskPreset[] = [
	{ count: 2, hint: '双盘位' },
	{ count: 4, hint: '入门 NAS' },
	{ count: 6, hint: '小型服务器' },
	{ count: 8, hint: '主流 NAS' },
	{ count: 12, hint: '机架存储' },
	{ count: 16, hint: '盘位扩展柜' },
	{ count: 24, hint: '高密度存储' },
	{ count: 36, hint: '大规模阵列' }
];

/** 单盘速度快捷预设：常见介质的典型顺序读写速度（MB/s） */
export const DISK_SPEED_PRESETS: RaidDiskSpeedPreset[] = [
	{ label: '机械盘 7200', speed: 200, hint: '消费级 3.5 寸 7200 转机械盘，顺序读写典型值约 200 MB/s' },
	{ label: '企业级机械盘', speed: 260, hint: '企业级 2.5 寸 10K / 15K 转机械盘，典型值约 260 MB/s' },
	{ label: 'SATA SSD', speed: 530, hint: 'SATA 接口 SSD，顺序读写接近接口上限约 530 MB/s' },
	{ label: 'NVMe SSD', speed: 3500, hint: 'PCIe 3.0 / 4.0 x4 NVMe SSD，典型值约 3500 MB/s' }
];

/** 硬盘接口与链路规格（带宽为单盘顺序带宽，单位 MB/s） */
export const DISK_INTERFACES: RaidInterface[] = [
	{
		id: 'sata2',
		name: 'SATA 3 Gb/s',
		alias: 'SATA II',
		linkSpeed: 300,
		usableSpeed: 280,
		hint: '老式机械盘接口，已基本淘汰'
	},
	{
		id: 'sata3',
		name: 'SATA 6 Gb/s',
		alias: 'SATA III',
		linkSpeed: 600,
		usableSpeed: 550,
		hint: '机械盘与 SATA SSD 的主流接口'
	},
	{
		id: 'sas12',
		name: 'SAS 12 Gb/s',
		alias: 'SAS 3.0',
		linkSpeed: 1200,
		usableSpeed: 1100,
		hint: '企业级机械盘 / SAS SSD，支持双端口冗余'
	},
	{
		id: 'sas24',
		name: 'SAS 24 Gb/s',
		alias: 'SAS 4.0',
		linkSpeed: 2400,
		usableSpeed: 2200,
		hint: '新一代企业级 SAS SSD'
	},
	{
		id: 'nvme3',
		name: 'PCIe 3.0 x4',
		alias: 'NVMe U.2 / M.2',
		linkSpeed: 3940,
		usableSpeed: 3500,
		hint: 'PCIe 3.0 x4 通道，单盘约 3.5 GB/s'
	},
	{
		id: 'nvme4',
		name: 'PCIe 4.0 x4',
		alias: 'NVMe U.2 / M.2',
		linkSpeed: 7880,
		usableSpeed: 7000,
		hint: 'PCIe 4.0 x4 通道，单盘约 7 GB/s'
	},
	{
		id: 'nvme5',
		name: 'PCIe 5.0 x4',
		alias: 'NVMe U.2 / M.2',
		linkSpeed: 15760,
		usableSpeed: 14000,
		hint: 'PCIe 5.0 x4 通道，单盘约 14 GB/s'
	}
];

/** 全部 RAID 等级元信息（按分类顺序排列） */
export const RAID_LEVELS: RaidLevelMeta[] = [
	{
		id: 'jbod',
		name: 'JBOD',
		alias: '线性叠加 / Span',
		category: 'span',
		minDisks: 1,
		readPerf: '等于单盘（无并行）',
		writePerf: '等于单盘（无并行）',
		summary: '多块盘首尾相接拼成一个大盘，容量全部可用但没有任何冗余，任一盘损坏整盘数据不可用'
	},
	{
		id: 'raid0',
		name: 'RAID 0',
		alias: '条带 / Striping',
		category: 'stripe',
		minDisks: 2,
		readPerf: '约 N 倍（全盘并行读）',
		writePerf: '约 N 倍（全盘并行写）',
		summary: '数据分片并行读写，性能最高、容量全可用，但无冗余，任一盘故障数据全部丢失'
	},
	{
		id: 'raid1',
		name: 'RAID 1',
		alias: '镜像 / Mirroring',
		category: 'mirror',
		minDisks: 2,
		readPerf: '约 N 倍（可从任一镜像读）',
		writePerf: '约等于单盘（需写入全部镜像）',
		summary: '磁盘两两镜像（支持 N 路镜像），可靠性高，但容量只等于 1 块盘，成本最高'
	},
	{
		id: 'raid1e',
		name: 'RAID 1E',
		alias: '增强镜像 / Enhanced Mirror',
		category: 'mirror',
		minDisks: 3,
		readPerf: '约 N/2 倍',
		writePerf: '约 N/2 倍（每份数据写两块盘）',
		summary: '条带化镜像，支持奇数块磁盘，容量约为一半，比 RAID 10 少浪费一块盘的容量'
	},
	{
		id: 'raid3',
		name: 'RAID 3',
		alias: '字节级校验 / 专用校验盘',
		category: 'parity',
		minDisks: 3,
		readPerf: '约 N-1 倍（连续读友好）',
		writePerf: '较低（校验盘成为瓶颈）',
		summary: '字节级条带 + 专用校验盘，适合大文件连续读写，已基本被 RAID 5 取代'
	},
	{
		id: 'raid4',
		name: 'RAID 4',
		alias: '块级校验 / 专用校验盘',
		category: 'parity',
		minDisks: 3,
		readPerf: '约 N-1 倍',
		writePerf: '较低（随机写受校验盘限制）',
		summary: '块级条带 + 专用校验盘，随机写性能差，实际很少使用'
	},
	{
		id: 'raid5',
		name: 'RAID 5',
		alias: '分布式奇偶校验',
		category: 'parity',
		minDisks: 3,
		readPerf: '约 N-1 倍',
		writePerf: '存在写惩罚（随机写约为单盘 1/4）',
		summary: '校验信息分散在所有盘上，容量与性能兼顾，最常用的均衡方案，可坏 1 块盘'
	},
	{
		id: 'raid5e',
		name: 'RAID 5E',
		alias: '带内热备 / In-band Spare',
		category: 'parity',
		minDisks: 4,
		readPerf: '约 N-2 倍',
		writePerf: '存在写惩罚，略低于 RAID 5',
		summary: 'RAID 5 外加 1 块盘的带内热备空间（分散在各盘），坏盘后自动顶替，无需人工换盘'
	},
	{
		id: 'raid5ee',
		name: 'RAID 5EE',
		alias: '加速带内热备',
		category: 'parity',
		minDisks: 4,
		readPerf: '约 N-2 倍',
		writePerf: '存在写惩罚',
		summary: '热备空间分散到所有磁盘，重建速度更快，容量与容错能力与 RAID 5E 相同'
	},
	{
		id: 'raid6',
		name: 'RAID 6',
		alias: '双校验 / Dual Parity',
		category: 'parity',
		minDisks: 4,
		readPerf: '约 N-2 倍',
		writePerf: '写惩罚较高（随机写约为单盘 1/6）',
		summary: '两组独立校验，可同时坏 2 块盘，适合大容量阵列，代价是 2 块盘的容量开销'
	},
	{
		id: 'raid6e',
		name: 'RAID 6E',
		alias: '双校验带内热备',
		category: 'parity',
		minDisks: 5,
		readPerf: '约 N-3 倍',
		writePerf: '写惩罚高',
		summary: 'RAID 6 外加 1 块盘的带内热备空间，可坏 2 块盘并自动重建，容量开销 3 块盘'
	},
	{
		id: 'raidtp',
		name: 'RAID-TP',
		alias: '三重校验 / Triple Parity',
		category: 'parity',
		minDisks: 5,
		readPerf: '约 N-3 倍',
		writePerf: '写惩罚最高',
		summary: '三重独立校验，可同时坏 3 块盘，适合超大容量（100 TB 以上）阵列，企业存储支持'
	},
	{
		id: 'raid10',
		name: 'RAID 10',
		alias: '1+0 镜像条带',
		category: 'nested',
		minDisks: 4,
		evenOnly: true,
		readPerf: '约 N 倍（条带 + 多镜像并行读）',
		writePerf: '约 N/2 倍',
		summary: '先镜像再条带，性能与可靠性最佳、重建最快，容量利用率固定 50%，成本最高'
	},
	{
		id: 'raid01',
		name: 'RAID 01',
		alias: '0+1 条带镜像',
		category: 'nested',
		minDisks: 4,
		evenOnly: true,
		readPerf: '约 N 倍',
		writePerf: '约 N/2 倍',
		summary: '先条带再镜像，容量与 RAID 10 相同，但一块盘故障就可能拖垮半个阵列，可靠性低于 RAID 10'
	},
	{
		id: 'raid50',
		name: 'RAID 50',
		alias: '5+0 校验条带',
		category: 'nested',
		minDisks: 6,
		needsSpan: true,
		minSpanDisks: 3,
		readPerf: '约 N-子组数 倍',
		writePerf: '存在写惩罚，但优于 RAID 6',
		summary: '多个 RAID 5 子组再条带，每个子组可坏 1 块盘，容量与性能折中，适合中等容量阵列'
	},
	{
		id: 'raid51',
		name: 'RAID 51',
		alias: '5+1 校验镜像',
		category: 'nested',
		minDisks: 6,
		evenOnly: true,
		readPerf: '约 N/2-1 倍',
		writePerf: '写惩罚较高',
		summary: '两个 RAID 5 子组互为镜像，每组可坏 1 块盘，容量利用率低，实际很少使用'
	},
	{
		id: 'raid60',
		name: 'RAID 60',
		alias: '6+0 双校验条带',
		category: 'nested',
		minDisks: 8,
		needsSpan: true,
		minSpanDisks: 4,
		readPerf: '约 N-2×子组数 倍',
		writePerf: '写惩罚高',
		summary: '多个 RAID 6 子组再条带，每个子组可坏 2 块盘，兼顾大容量与高容错'
	},
	{
		id: 'raid61',
		name: 'RAID 61',
		alias: '6+1 双校验镜像',
		category: 'nested',
		minDisks: 8,
		evenOnly: true,
		readPerf: '约 N/2-2 倍',
		writePerf: '写惩罚很高',
		summary: '两个 RAID 6 子组互为镜像，每组可坏 2 块盘，可靠性极高但容量开销大'
	},
	{
		id: 'shr',
		name: 'SHR',
		alias: '群晖混合 RAID / Synology Hybrid RAID',
		category: 'hybrid',
		minDisks: 2,
		readPerf: '同 RAID 5（等容量盘时）',
		writePerf: '同 RAID 5（等容量盘时）',
		summary: '群晖私有：等容量盘时等价 RAID 5（2 块盘等价 RAID 1），混合容量盘可减少空间浪费，可坏 1 块盘'
	},
	{
		id: 'shr2',
		name: 'SHR-2',
		alias: '群晖双盘冗余',
		category: 'hybrid',
		minDisks: 4,
		readPerf: '同 RAID 6（等容量盘时）',
		writePerf: '同 RAID 6（等容量盘时）',
		summary: '群晖私有：等容量盘时等价 RAID 6，可同时坏 2 块盘，需至少 4 块盘'
	}
];

/** 单盘容量换算为字节 */
export function calcDiskBytes(size: number, unit: RaidDiskUnit): number {
	const value = Number.isFinite(size) && size > 0 ? size : 0;
	return value * UNIT_BYTES[unit];
}

/** 十进制容量格式化（TB / GB / MB / KB 自动降级） */
function formatDecimal(bytes: number): string {
	if (bytes <= 0) return '0 TB';
	if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
	if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
	if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
	return `${(bytes / 1e3).toFixed(2)} KB`;
}

/** 二进制容量格式化（TiB / GiB / MiB / KiB 自动降级） */
function formatBinary(bytes: number): string {
	if (bytes <= 0) return '0 TiB';
	if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(2)} TiB`;
	if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
	if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
	return `${(bytes / 1024).toFixed(2)} KiB`;
}

/** 字节数转为容量对象（同时给出十进制与二进制展示文案） */
export function toCapacity(bytes: number): RaidCapacity {
	const safe = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
	return { bytes: safe, decimal: formatDecimal(safe), binary: formatBinary(safe) };
}

/** 占比格式化为百分比文案 */
export function formatPercent(ratio: number): string {
	if (!Number.isFinite(ratio) || ratio <= 0) return '0%';
	return `${(ratio * 100).toFixed(1)}%`;
}

/** 字节数精确格式化（千分位 + B） */
export function formatByteCount(bytes: number): string {
	const safe = Number.isFinite(bytes) && bytes > 0 ? Math.round(bytes) : 0;
	return `${safe.toLocaleString('zh-CN')} B`;
}

/** 带宽格式化（MB/s 超过 1000 时换算为 GB/s） */
export function formatSpeed(mbPerSecond: number): string {
	if (!Number.isFinite(mbPerSecond) || mbPerSecond <= 0) return '—';
	if (mbPerSecond >= 1000) return `${(mbPerSecond / 1000).toFixed(2)} GB/s`;
	return `${Math.round(mbPerSecond)} MB/s`;
}

/** 按接口标识取接口规格（找不到时回退到 SATA 6 Gb/s） */
export function getRaidInterface(id: RaidInterfaceId): RaidInterface {
	return DISK_INTERFACES.find((item) => item.id === id) ?? DISK_INTERFACES[1];
}

/**
 * 综合单盘实测速度与链路可用带宽：
 * 机械盘通常跑不满接口带宽（受磁盘限制），而 SSD 可能被接口带宽限制，
 * 因此有效速度取两者较小值，并给出瓶颈来源。
 */
export function resolveDiskSpeed(diskSpeed: number, linkSpeed: number): RaidSpeedLimit {
	const disk = Number.isFinite(diskSpeed) && diskSpeed > 0 ? diskSpeed : 0;
	const link = Number.isFinite(linkSpeed) && linkSpeed > 0 ? linkSpeed : 0;
	const effectiveSpeed = Math.min(disk, link);
	let bottleneck: RaidSpeedBottleneck = 'balanced';
	if (disk > link) bottleneck = 'link';
	else if (disk < link) bottleneck = 'disk';
	return { diskSpeed: disk, linkSpeed: link, effectiveSpeed, bottleneck };
}

/** 瓶颈来源文案 */
export const RAID_BOTTLENECK_LABELS: Record<RaidSpeedBottleneck, string> = {
	disk: '受磁盘本身限制',
	link: '受接口链路限制',
	balanced: '磁盘与链路相当'
};

/** 按等级标识取元信息（找不到时回退到第一项） */
export function getRaidLevel(id: RaidLevelId): RaidLevelMeta {
	return RAID_LEVELS.find((level) => level.id === id) ?? RAID_LEVELS[0];
}

/** 组装磁盘角色分解结果，避免各处重复书写对象字面量 */
function shape(
	dataDisks: number,
	parityDisks: number,
	spans: number,
	spanDisks: number,
	faultTolerance: number,
	usableDisks: number
): RaidDiskShape {
	return { dataDisks, parityDisks, spans, spanDisks, faultTolerance, usableDisks };
}

/**
 * 计算各等级的磁盘角色分解。
 * 仅在磁盘数量已通过合法性校验后调用，因此嵌套等级的整除关系成立。
 */
function calcShape(level: RaidLevelId, diskCount: number, groupDisks: number): RaidDiskShape {
	switch (level) {
		case 'jbod':
		case 'raid0':
			return shape(diskCount, 0, 1, diskCount, 0, diskCount);
		case 'raid1':
			return shape(1, diskCount - 1, 1, diskCount, diskCount - 1, 1);
		case 'raid1e': {
			const data = Math.floor(diskCount / 2);
			return shape(data, diskCount - data, 1, diskCount, 1, data);
		}
		case 'raid3':
		case 'raid4':
		case 'raid5':
			return shape(diskCount - 1, 1, 1, diskCount, 1, diskCount - 1);
		case 'raid5e':
		case 'raid5ee':
			return shape(diskCount - 2, 2, 1, diskCount, 1, diskCount - 2);
		case 'raid6':
			return shape(diskCount - 2, 2, 1, diskCount, 2, diskCount - 2);
		case 'raid6e':
			return shape(diskCount - 3, 3, 1, diskCount, 2, diskCount - 3);
		case 'raidtp':
			return shape(diskCount - 3, 3, 1, diskCount, 3, diskCount - 3);
		case 'raid10':
		case 'raid01':
			return shape(diskCount / 2, diskCount / 2, diskCount / 2, 2, diskCount / 2, diskCount / 2);
		case 'raid50': {
			const spans = diskCount / groupDisks;
			return shape(diskCount - spans, spans, spans, groupDisks, spans, diskCount - spans);
		}
		case 'raid51': {
			const half = diskCount / 2;
			return shape(half - 1, half + 1, 2, half, 2, half - 1);
		}
		case 'raid60': {
			const spans = diskCount / groupDisks;
			return shape(diskCount - spans * 2, spans * 2, spans, groupDisks, spans * 2, diskCount - spans * 2);
		}
		case 'raid61': {
			const half = diskCount / 2;
			return shape(half - 2, half + 2, 2, half, 4, half - 2);
		}
		case 'shr':
			// 等容量盘：2 块盘等价 RAID 1，3 块及以上等价 RAID 5
			return diskCount <= 2
				? shape(1, diskCount - 1, 1, diskCount, 1, 1)
				: shape(diskCount - 1, 1, 1, diskCount, 1, diskCount - 1);
		case 'shr2':
			return shape(diskCount - 2, 2, 1, diskCount, 2, diskCount - 2);
	}
}

/** 生成容错能力描述文案 */
function buildFaultText(level: RaidLevelId, category: RaidCategory, faultTolerance: number, spans: number): string {
	if (faultTolerance <= 0) return '无冗余，任一磁盘故障都会导致数据丢失';
	if (level === 'raid10') return `每个镜像组可损坏 1 块，最多 ${faultTolerance} 块`;
	if (level === 'raid01') return `最多 ${faultTolerance} 块，但对故障分布敏感，实际可靠性低于 RAID 10`;
	if (level === 'raid1e') return `最多 1 块，理想交错下可达 ${faultTolerance} 块`;
	if (level === 'raid51' || level === 'raid61')
		return `每个子组可损坏 ${faultTolerance / 2} 块，最多 ${faultTolerance} 块`;
	if (category === 'nested' && spans > 1)
		return `每个子组可损坏 ${faultTolerance / spans} 块，最多 ${faultTolerance} 块`;
	return `可同时损坏 ${faultTolerance} 块磁盘`;
}

/** 计算指定 RAID 等级的容量、容错与性能信息 */
export function calcRaidLevel(level: RaidLevelId, input: RaidCalcInput): RaidCalcResult {
	const meta = getRaidLevel(level);
	const diskBytes = calcDiskBytes(input.diskSize, input.diskUnit);
	const totalDisks = Math.max(0, Math.floor(input.diskCount) || 0);
	const hotSpares = Math.min(Math.max(0, Math.floor(input.hotSpareCount) || 0), totalDisks);
	const arrayDisks = totalDisks - hotSpares;
	const groupDisks = Math.max(1, Math.floor(input.spanDisks) || 0);

	// 磁盘数量合法性校验：不满足条件时仅给出原因，容量一律按 0 处理，避免误导
	const reasons: string[] = [];
	if (arrayDisks < meta.minDisks) {
		reasons.push(`阵列磁盘不足，至少需要 ${meta.minDisks} 块（当前 ${arrayDisks} 块）`);
	}
	if (meta.evenOnly && arrayDisks % 2 !== 0) {
		reasons.push('阵列磁盘数必须为偶数');
	}
	if (meta.needsSpan) {
		const minSpan = meta.minSpanDisks ?? 3;
		if (groupDisks < minSpan) {
			reasons.push(`子组磁盘数至少 ${minSpan} 块`);
		} else if (arrayDisks % groupDisks !== 0) {
			reasons.push(`阵列磁盘数需为子组磁盘数 ${groupDisks} 的整数倍`);
		} else if (arrayDisks / groupDisks < 2) {
			reasons.push('嵌套阵列至少需要 2 个子组');
		}
	}

	const valid = reasons.length === 0;
	const rawBytes = arrayDisks * diskBytes;
	const raw = toCapacity(rawBytes);

	if (!valid) {
		return {
			level,
			name: meta.name,
			category: meta.category,
			valid: false,
			reason: reasons.join('；'),
			arrayDisks,
			dataDisks: 0,
			parityDisks: 0,
			spans: 1,
			spanDisks: arrayDisks,
			raw,
			usable: toCapacity(0),
			overhead: toCapacity(0),
			efficiency: 0,
			faultTolerance: 0,
			faultText: '磁盘数量不足，无法组成该阵列',
			readPerf: meta.readPerf,
			writePerf: meta.writePerf
		};
	}

	const detail = calcShape(level, arrayDisks, groupDisks);
	const usableBytes = detail.usableDisks * diskBytes;

	return {
		level,
		name: meta.name,
		category: meta.category,
		valid: true,
		reason: '',
		arrayDisks,
		dataDisks: detail.dataDisks,
		parityDisks: detail.parityDisks,
		spans: detail.spans,
		spanDisks: detail.spanDisks,
		raw,
		usable: toCapacity(usableBytes),
		overhead: toCapacity(Math.max(0, rawBytes - usableBytes)),
		efficiency: rawBytes > 0 ? usableBytes / rawBytes : 0,
		faultTolerance: detail.faultTolerance,
		faultText: buildFaultText(level, meta.category, detail.faultTolerance, detail.spans),
		readPerf: meta.readPerf,
		writePerf: meta.writePerf
	};
}

/** 计算全部 RAID 等级（用于横向对比表） */
export function calcAllRaidLevels(input: RaidCalcInput): RaidCalcResult[] {
	return RAID_LEVELS.map((meta) => calcRaidLevel(meta.id, input));
}
