<script lang="ts" setup>
	import type { RaidCapacitySegment } from '@/types/raid';

	defineProps<{
		/** 容量分段（可用数据 / 冗余开销 / 热备），占比相对总物理容量 */
		segments: RaidCapacitySegment[];
		/** 总物理容量展示文案 */
		total: string;
	}>();
</script>

<template>
	<div>
		<div class="mb-1 flex items-center justify-between">
			<span class="text-[10px] font-semibold text-slate-500">容量构成</span>
			<span class="font-mono text-[10px] text-slate-400">总物理容量 {{ total }}</span>
		</div>

		<!-- 堆叠容量条：各分段宽度按占比渲染 -->
		<div class="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
			<div
				v-for="segment in segments"
				:key="segment.key"
				:class="segment.color"
				:style="{ width: `${Math.max(segment.ratio * 100, 0)}%` }"
				:title="`${segment.label}：${segment.value}`"
				class="h-full transition-all duration-300"
			/>
		</div>

		<!-- 图例：色块 + 名称 + 容量 -->
		<div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
			<div v-for="segment in segments" :key="segment.key" class="flex items-center gap-1">
				<span :class="segment.color" class="h-2 w-2 rounded-sm" />
				<span class="text-[10px] text-slate-500">{{ segment.label }}</span>
				<span class="font-mono text-[10px] font-semibold text-slate-700">{{ segment.value }}</span>
			</div>
		</div>
	</div>
</template>
