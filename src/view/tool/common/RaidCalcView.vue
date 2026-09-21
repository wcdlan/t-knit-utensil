<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		calcAllRaidLevels,
		calcDiskBytes,
		calcRaidLevel,
		formatPercent,
		formatSpeed,
		getRaidInterface,
		getRaidLevel,
		RAID_CATEGORY_LABELS,
		RAID_LEVELS,
		toCapacity
	} from '@/utils/raid';
	import AboutPanel from '@/fragment/tool/common/raid-calc/AboutPanel.vue';
	import DiskConfigPanel from '@/fragment/tool/common/raid-calc/DiskConfigPanel.vue';
	import DiskSpecPanel from '@/fragment/tool/common/raid-calc/DiskSpecPanel.vue';
	import HotSparePanel from '@/fragment/tool/common/raid-calc/HotSparePanel.vue';
	import LevelSelectPanel from '@/fragment/tool/common/raid-calc/LevelSelectPanel.vue';
	import LevelComparePanel from '@/fragment/tool/common/raid-calc/LevelComparePanel.vue';
	import ResultPanel from '@/fragment/tool/common/raid-calc/ResultPanel.vue';
	import SelectedLevelPanel from '@/fragment/tool/common/raid-calc/SelectedLevelPanel.vue';
	import SpanConfigPanel from '@/fragment/tool/common/raid-calc/SpanConfigPanel.vue';
	import type {
		RaidCalcInput,
		RaidCapacitySegment,
		RaidDiskUnit,
		RaidInterfaceId,
		RaidLevelId,
		RaidSpareScope
	} from '@/types/raid';

	/** 默认单盘容量（TB） */
	const DEFAULT_DISK_SIZE = 4;
	/** 默认磁盘总数（含热备） */
	const DEFAULT_DISK_COUNT = 8;
	/** 默认热备盘数量 */
	const DEFAULT_HOT_SPARE = 1;
	/** 默认子组磁盘数（RAID 50 / 60） */
	const DEFAULT_SPAN_DISKS = 4;
	/** 默认硬盘接口：SATA 6 Gb/s（NAS / 服务器机械盘最常见） */
	const DEFAULT_INTERFACE: RaidInterfaceId = 'sata3';
	/** 容量构成分段配色（Tailwind 背景类） */
	const SEGMENT_COLORS = {
		usable: 'bg-blue-500',
		overhead: 'bg-amber-400',
		spare: 'bg-emerald-400'
	} as const;

	/** 单盘容量数值 */
	const diskSize = ref(DEFAULT_DISK_SIZE);
	/** 单盘容量单位 */
	const diskUnit = ref<RaidDiskUnit>('TB');
	/** 总磁盘数（含热备盘） */
	const diskCount = ref(DEFAULT_DISK_COUNT);
	/** 热备盘数量 */
	const hotSpareCount = ref(DEFAULT_HOT_SPARE);
	/** 热备盘作用范围 */
	const spareScope = ref<RaidSpareScope>('global');
	/** 当前选中的 RAID 等级 */
	const level = ref<RaidLevelId>('raid5');
	/** 嵌套等级的子组磁盘数 */
	const spanDisks = ref(DEFAULT_SPAN_DISKS);
	/** 对比表是否只展示可用等级 */
	const availableOnly = ref(false);
	/** 硬盘接口类型（决定单盘链路带宽） */
	const interfaceId = ref<RaidInterfaceId>(DEFAULT_INTERFACE);

	/** 当前等级元信息 */
	const levelMeta = computed(() => getRaidLevel(level.value));
	/** 阵列磁盘数（总磁盘数 - 热备盘） */
	const arrayDisks = computed(() => Math.max(0, diskCount.value - hotSpareCount.value));
	/** 热备盘数量上限：至少保留 1 块阵列磁盘 */
	const maxSpare = computed(() => Math.max(0, diskCount.value - 1));

	/** 计算器输入（集中打包，供各级计算复用） */
	const input = computed<RaidCalcInput>(() => ({
		diskSize: diskSize.value,
		diskUnit: diskUnit.value,
		diskCount: diskCount.value,
		hotSpareCount: hotSpareCount.value,
		spareScope: spareScope.value,
		spanDisks: spanDisks.value
	}));

	/** 单盘容量（字节） */
	const diskBytes = computed(() => calcDiskBytes(diskSize.value, diskUnit.value));
	/** 单盘容量展示文案 */
	const diskLabel = computed(() => toCapacity(diskBytes.value).decimal);
	/** 总物理容量（含热备盘） */
	const totalPhysical = computed(() => toCapacity(diskCount.value * diskBytes.value));
	/** 热备容量 */
	const spareCapacity = computed(() => toCapacity(hotSpareCount.value * diskBytes.value));

	/** 当前等级的完整计算结果 */
	const result = computed(() => calcRaidLevel(level.value, input.value));
	/** 全部等级的计算结果（横向对比） */
	const allResults = computed(() => calcAllRaidLevels(input.value));
	/** 对比表展示的数据（可选只保留可用等级） */
	const visibleResults = computed(() =>
		availableOnly.value ? allResults.value.filter((item) => item.valid) : allResults.value
	);

	/** 单块硬盘容量（标称 / 实际 / 字节数） */
	const diskCapacity = computed(() => toCapacity(diskBytes.value));
	/** 单块硬盘在阵列中的有效容量贡献（可用容量 ÷ 阵列磁盘数） */
	const perDiskUsable = computed(() => {
		const item = result.value;
		if (!item.valid || item.arrayDisks <= 0) return toCapacity(0);
		return toCapacity(item.usable.bytes / item.arrayDisks);
	});

	/** 当前接口规格 */
	const currentInterface = computed(() => getRaidInterface(interfaceId.value));
	/** 阵列顺序读聚合带宽（MB/s）：阵列磁盘均可并行读 */
	const readSpeed = computed(() =>
		result.value.valid ? currentInterface.value.effectiveSpeed * result.value.arrayDisks : 0
	);
	/** 阵列顺序写聚合带宽（MB/s）：数据盘并行写，镜像 / 校验等级已按数据盘折算 */
	const writeSpeed = computed(() =>
		result.value.valid ? currentInterface.value.effectiveSpeed * result.value.dataDisks : 0
	);

	/** 容量构成分段（相对总物理容量） */
	const segments = computed<RaidCapacitySegment[]>(() => {
		const total = totalPhysical.value.bytes;
		const list: RaidCapacitySegment[] = [
			{
				key: 'usable',
				label: '可用数据',
				value: result.value.usable.decimal,
				ratio: total > 0 ? result.value.usable.bytes / total : 0,
				color: SEGMENT_COLORS.usable
			},
			{
				key: 'overhead',
				label: '冗余开销',
				value: result.value.overhead.decimal,
				ratio: total > 0 ? result.value.overhead.bytes / total : 0,
				color: SEGMENT_COLORS.overhead
			}
		];
		if (hotSpareCount.value > 0) {
			list.push({
				key: 'spare',
				label: spareScope.value === 'global' ? '热备预留（全局）' : '热备预留（专用）',
				value: spareCapacity.value.decimal,
				ratio: total > 0 ? spareCapacity.value.bytes / total : 0,
				color: SEGMENT_COLORS.spare
			});
		}
		return list;
	});

	/** 当前结果摘要（复制用纯文本） */
	const summary = computed(() => {
		const item = result.value;
		if (!item.valid) return `${item.name}：${item.reason}`;
		const scopeText = spareScope.value === 'global' ? '全局热备' : '专用热备';
		return [
			`${item.name}（${levelMeta.value.alias}）`,
			`磁盘配置：${diskCount.value} 块 ${diskLabel.value}，热备 ${hotSpareCount.value} 块（${scopeText}），阵列 ${item.arrayDisks} 块`,
			`可用容量：${item.usable.decimal}（系统显示约 ${item.usable.binary}）`,
			`阵列原始容量：${item.raw.decimal}；冗余开销：${item.overhead.decimal}；利用率：${formatPercent(item.efficiency)}`,
			`总物理容量：${totalPhysical.value.decimal}；热备容量：${spareCapacity.value.decimal}`,
			`单盘有效贡献：${perDiskUsable.value.decimal}；接口：${currentInterface.value.name}`,
			`聚合带宽（顺序）：读约 ${formatSpeed(readSpeed.value)}、写约 ${formatSpeed(writeSpeed.value)}`,
			`容错能力：${item.faultText}`,
			`读性能：${item.readPerf}；写性能：${item.writePerf}`
		].join('\n');
	});

	/** 全等级对比表摘要（制表符分隔，便于粘贴到表格软件） */
	const compareSummary = computed(() => {
		const scopeText = spareScope.value === 'global' ? '全局热备' : '专用热备';
		const header = `RAID 存储容量对比（${diskCount.value} 块 ${diskLabel.value}，${scopeText} ${hotSpareCount.value} 块，阵列 ${arrayDisks.value} 块）`;
		const columns = ['等级', '分类', '磁盘结构', '可用容量', '利用率', '容错'];
		const rows = visibleResults.value.map((item) => {
			const structure = item.valid
				? item.spans > 1
					? `${item.spans} 组 × ${item.spanDisks} 块`
					: `${item.arrayDisks} 块`
				: `最少 ${item.arrayDisks} 块`;
			return [
				item.name,
				RAID_CATEGORY_LABELS[item.category],
				structure,
				item.valid ? item.usable.decimal : '—',
				item.valid ? formatPercent(item.efficiency) : '—',
				item.valid ? (item.faultTolerance > 0 ? `${item.faultTolerance} 块` : '无冗余') : '盘数不足'
			].join('\t');
		});
		return [header, columns.join('\t'), ...rows].join('\n');
	});

	/** 为嵌套等级挑选第一个合法子组磁盘数 */
	function firstValidSpan(min: number, disks: number): number {
		for (let size = min; size <= disks / 2; size++) {
			if (disks % size === 0) return size;
		}
		return min;
	}

	// 磁盘总数变化时收敛热备数量，保证至少保留 1 块阵列磁盘
	watch(diskCount, (count) => {
		const max = Math.max(0, count - 1);
		if (hotSpareCount.value > max) hotSpareCount.value = max;
	});

	// 等级 / 磁盘总数变化时校准子组磁盘数，避免停留在无法整除的取值上
	watch([level, diskCount], () => {
		const meta = levelMeta.value;
		if (!meta.needsSpan) return;
		const min = meta.minSpanDisks ?? 3;
		if (spanDisks.value < min || arrayDisks.value % spanDisks.value !== 0) {
			spanDisks.value = firstValidSpan(min, arrayDisks.value);
		}
	});

	/** 复制回调：统一走剪贴板工具，自动弹出成功提示 */
	function copy(value: string) {
		copyToClipboard(value);
	}
</script>

<template>
	<!-- 根容器撑满工具内容区（ToolOutlet 已给 flex-1 min-h-0），底部不留空白 -->
	<div class="flex min-h-0 flex-col gap-3">
		<!-- AboutPanel：RAID 概念、可用容量算法与热备作用说明 -->
		<AboutPanel class="shrink-0" />

		<!-- 工作台布局：左侧配置栏（固定宽，自然高度，允许左下留白），右侧结果区（自适应并撑满高度） -->
		<div class="grid gap-3 lg:flex-1 lg:grid-cols-[336px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
			<div class="flex flex-col gap-3">
				<!-- DiskConfigPanel：单盘容量（数值 + 单位）与磁盘总数（含快捷盘位预设） -->
				<DiskConfigPanel
					:disk-count="diskCount"
					:disk-size="diskSize"
					:disk-unit="diskUnit"
					@update:disk-count="(v: number) => (diskCount = v)"
					@update:disk-size="(v: number) => (diskSize = v)"
					@update:disk-unit="(v: RaidDiskUnit) => (diskUnit = v)"
				/>
				<!-- HotSparePanel：热备盘数量与作用范围（全局 / 专用）选择 -->
				<HotSparePanel
					:array-disks="arrayDisks"
					:hot-spare-count="hotSpareCount"
					:max-spare="maxSpare"
					:spare-capacity="spareCapacity.decimal"
					:spare-scope="spareScope"
					@update:hot-spare-count="(v: number) => (hotSpareCount = v)"
					@update:spare-scope="(v: RaidSpareScope) => (spareScope = v)"
				/>
				<!-- LevelSelectPanel：全部 RAID 等级选择（按分类分组，标注可用状态） -->
				<LevelSelectPanel
					:levels="RAID_LEVELS"
					:results="allResults"
					:selected="level"
					@select="(v: RaidLevelId) => (level = v)"
				/>
				<!-- SelectedLevelPanel：当前选中等级的取舍说明（独立于等级面板，置于其下方） -->
				<SelectedLevelPanel :meta="levelMeta" :result="result" />
				<!-- SpanConfigPanel：嵌套等级（RAID 50 / 60）的子组磁盘数配置 -->
				<SpanConfigPanel
					v-if="levelMeta.needsSpan"
					:array-disks="arrayDisks"
					:level-name="levelMeta.name"
					:min-span-disks="levelMeta.minSpanDisks ?? 3"
					:span-disks="spanDisks"
					:sub-level-name="levelMeta.id === 'raid60' ? 'RAID 6' : 'RAID 5'"
					@update:span-disks="(v: number) => (spanDisks = v)"
				/>
			</div>

			<div class="flex flex-col gap-3 lg:min-h-0">
				<!-- DiskSpecPanel：单块硬盘容量参数与接口链路带宽估算 -->
				<DiskSpecPanel
					:array-disks="arrayDisks"
					:data-disks="result.dataDisks"
					:disk-capacity="diskCapacity"
					:interface-id="interfaceId"
					:per-disk-usable="perDiskUsable"
					:read-speed="readSpeed"
					:valid="result.valid"
					:write-speed="writeSpeed"
					@copy="copy"
					@update:interface-id="(v: RaidInterfaceId) => (interfaceId = v)"
				/>

				<!-- ResultPanel：当前等级的容量 / 利用率 / 容错 / 读写性能结果 -->
				<ResultPanel
					:disk-label="diskLabel"
					:hot-spare-count="hotSpareCount"
					:result="result"
					:segments="segments"
					:spare-capacity="spareCapacity"
					:spare-scope="spareScope"
					:summary="summary"
					:total-physical="totalPhysical"
					@copy="copy"
				/>

				<!-- LevelComparePanel：同一磁盘配置下全部等级的容量对比表，宽屏下拉伸撑满右栏 -->
				<LevelComparePanel
					:available-only="availableOnly"
					:levels="RAID_LEVELS"
					:results="visibleResults"
					:selected="level"
					class="lg:min-h-0 lg:flex-1"
					@select="(v: RaidLevelId) => (level = v)"
					@copy-all="copy(compareSummary)"
					@update:available-only="(v: boolean) => (availableOnly = v)"
				/>
			</div>
		</div>
	</div>
</template>
