<script lang="ts" setup>
	defineProps<{
		toolCount: number;
		groupCount: number;
	}>();
</script>

<template>
	<!-- 统计徽标：工具总数与分类数 -->
	<div class="mt-7 flex flex-wrap items-center justify-center gap-3">
		<div
			class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur"
		>
			<span class="text-lg font-bold text-slate-800">{{ toolCount }}</span>
			<span class="text-xs text-slate-500">个工具</span>
		</div>
		<div
			class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur"
		>
			<span class="text-lg font-bold text-slate-800">{{ groupCount }}</span>
			<span class="text-xs text-slate-500">个分类</span>
		</div>
	</div>
</template>
