<script lang="ts" setup>
	import { computed } from 'vue';
	import { NAlert, NButton, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { formatPercent, getRaidLevel } from '@/utils/raid';
	import CapacityBar from '@/fragment/tool/common/raid-calc/CapacityBar.vue';
	import MetricRow from '@/fragment/tool/common/raid-calc/MetricRow.vue';
	import type { RaidCalcResult, RaidCapacity, RaidCapacitySegment, RaidSpareScope } from '@/types/raid';

	const props = defineProps<{
		/** 当前等级的计算结果 */
		result: RaidCalcResult;
		/** 容量构成分段 */
		segments: RaidCapacitySegment[];
		/** 总物理容量（含热备） */
		totalPhysical: RaidCapacity;
		/** 热备容量 */
		spareCapacity: RaidCapacity;
		/** 热备盘数量 */
		hotSpareCount: number;
		/** 热备盘作用范围 */
		spareScope: RaidSpareScope;
		/** 单盘容量展示文案 */
		diskLabel: string;
		/** 复制用的结果摘要文本 */
		summary: string;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();

	/** 当前等级的别名（如「分布式奇偶校验」） */
	const alias = computed(() => getRaidLevel(props.result.level).alias);

	/** 热备指标行名称（含数量与作用范围） */
	const spareLabel = computed(() => {
		if (props.hotSpareCount <= 0) return '热备容量';
		const scope = props.spareScope === 'global' ? '全局' : '专用';
		return `热备容量（${props.hotSpareCount} 块 · ${scope}）`;
	});

	/** 磁盘结构描述（嵌套等级展示子组数量） */
	const structureText = computed(() => {
		const { spans, spanDisks, dataDisks, parityDisks } = props.result;
		const roles = `数据 ${dataDisks} + 冗余 ${parityDisks}`;
		return spans > 1 ? `${spans} 组 × ${spanDisks} 块（${roles}）` : `${props.result.arrayDisks} 块（${roles}）`;
	});
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				<TkuIcon :name="icons.raid" :size="16" class="text-blue-500" />
				<h3 class="text-sm font-semibold text-slate-800">{{ result.name }}</h3>
				<n-tag round size="tiny" type="info">{{ alias }}</n-tag>
				<span v-if="!result.valid" class="text-xs text-red-500">磁盘配置不满足该等级要求</span>
			</div>
			<n-button :disabled="!result.valid" secondary size="tiny" @click="emit('copy', summary)">复制结果</n-button>
		</div>

		<!-- 磁盘数不足等非法配置：直接给出原因，不展示容量数字避免误导 -->
		<n-alert v-if="!result.valid" class="text-sm" type="error">
			{{ result.reason }}。请增加磁盘总数或调整热备数量后重试。
		</n-alert>

		<template v-else>
			<!-- 顶部：可用容量高亮卡 + 容量构成条，横向铺满结果区 -->
			<div class="flex flex-col gap-3 xl:flex-row">
				<div
					class="shrink-0 rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 xl:w-[220px]"
				>
					<div class="flex items-baseline justify-between gap-2">
						<span class="text-xs font-semibold text-blue-700">可用容量</span>
						<span class="font-mono text-xs text-blue-500">≈ {{ result.usable.binary }}</span>
					</div>
					<div class="mt-0.5 font-mono text-2xl font-bold leading-tight text-blue-700">
						{{ result.usable.decimal }}
					</div>
					<div class="mt-1.5 flex flex-wrap gap-1">
						<n-tag round size="tiny" type="info">利用率 {{ formatPercent(result.efficiency) }}</n-tag>
						<n-tag round size="tiny" type="success">容错 {{ result.faultTolerance }} 块</n-tag>
					</div>
					<p class="mt-1.5 text-xs leading-relaxed text-slate-500">{{ result.faultText }}</p>
				</div>

				<!-- CapacityBar：可用数据 / 冗余开销 / 热备 的容量构成堆叠条 -->
				<div class="min-w-0 flex-1">
					<CapacityBar :segments="segments" :total="totalPhysical.decimal" />
				</div>
			</div>

			<!-- 指标网格：容量 / 磁盘结构 / 读写性能，宽屏 3~4 列 -->
			<div class="mt-3 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				<!-- MetricRow：容量与磁盘指标，点击数值即复制 -->
				<MetricRow :value="result.raw.decimal" label="阵列原始容量" mono @copy="(v: string) => emit('copy', v)" />
				<MetricRow :value="result.overhead.decimal" label="冗余开销容量" mono @copy="(v: string) => emit('copy', v)" />
				<MetricRow :value="`${result.arrayDisks} 块`" label="阵列磁盘数" @copy="(v: string) => emit('copy', v)" />
				<MetricRow :value="structureText" label="磁盘结构" @copy="(v: string) => emit('copy', v)" />
				<MetricRow
					:value="`${result.dataDisks} / ${result.parityDisks}`"
					label="数据盘 / 冗余盘"
					@copy="(v: string) => emit('copy', v)"
				/>
				<MetricRow :value="diskLabel" label="单盘容量" @copy="(v: string) => emit('copy', v)" />
				<MetricRow
					:value="totalPhysical.decimal"
					label="总物理容量（含热备）"
					mono
					@copy="(v: string) => emit('copy', v)"
				/>
				<MetricRow
					:label="spareLabel"
					:value="hotSpareCount > 0 ? spareCapacity.decimal : '未启用'"
					mono
					@copy="(v: string) => emit('copy', v)"
				/>
				<MetricRow :value="result.readPerf" label="读性能" @copy="(v: string) => emit('copy', v)" />
				<MetricRow :value="result.writePerf" label="写性能" @copy="(v: string) => emit('copy', v)" />
			</div>
		</template>
	</div>
</template>
