<script lang="ts" setup>
	import { NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { formatPercent, RAID_CATEGORY_TAG_TYPES } from '@/utils/raid';
	import type { RaidCalcResult, RaidLevelMeta } from '@/types/raid';

	defineProps<{
		/** 当前选中等级的元信息 */
		meta: RaidLevelMeta;
		/** 当前等级的计算结果 */
		result: RaidCalcResult;
	}>();
</script>

<template>
	<!-- SelectedLevelPanel：当前选中等级的取舍说明，独立于等级选择面板单独展示 -->
	<div class="rounded-xl border border-slate-200 bg-white p-3">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.raid" :size="15" class="text-blue-500" />
				<span class="text-sm font-semibold text-slate-700">{{ meta.name }}</span>
				<n-tag :type="RAID_CATEGORY_TAG_TYPES[meta.category]" round size="tiny">{{ meta.alias }}</n-tag>
			</div>
			<n-tag :type="result.valid ? 'success' : 'error'" round size="tiny">
				{{ result.valid ? '可用' : '盘数不足' }}
			</n-tag>
		</div>

		<!-- 可用时说明该等级的取舍，不可用时直接给出原因 -->
		<p class="mt-1.5 text-[11px] leading-relaxed text-slate-500">
			{{ result.valid ? meta.summary : result.reason }}
		</p>

		<div v-if="result.valid" class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
			<span
				>最少 {{ meta.minDisks }} 盘{{ meta.evenOnly ? '（偶数）' : '' }}{{ meta.needsSpan ? '（配子组）' : '' }}</span
			>
			<span>·</span>
			<span>容错 {{ result.faultTolerance }} 块</span>
			<span>·</span>
			<span>利用率 {{ formatPercent(result.efficiency) }}</span>
			<span>·</span>
			<span class="font-mono font-semibold text-slate-600">{{ result.usable.decimal }}</span>
		</div>
	</div>
</template>
