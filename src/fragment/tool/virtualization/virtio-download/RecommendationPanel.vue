<script lang="ts" setup>
	import { NSpin } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { VirtioRecommendationRow } from '@/types/virtio';

	defineProps<{
		rows: VirtioRecommendationRow[];
		selected: string | null;
		loading: boolean;
	}>();

	const emit = defineEmits<{
		select: [version: string];
	}>();
</script>

<template>
	<!-- 推荐版本面板：各 Windows 系统推荐的 VirtIO 驱动版本，点击可快速选中 -->
	<div class="rounded-xl border border-slate-200/80 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center gap-2">
			<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
				<TkuIcon :name="icons.star" :size="16" />
			</div>
			<h3 class="text-sm font-semibold text-slate-700">各 Windows 版本推荐 VirtIO 驱动</h3>
			<span class="text-[11px] text-slate-400">点击系统名称可快速选中对应版本</span>
		</div>

		<div v-if="loading" class="flex items-center justify-center py-6">
			<n-spin size="small" />
		</div>

		<div v-else-if="rows.length === 0" class="py-4 text-center text-xs text-slate-400">版本列表加载完成后显示推荐</div>

		<div v-else class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			<!-- 每个系统一行：显示系统名 + 推荐版本，可用时可点击选中 -->
			<button
				v-for="row in rows"
				:key="row.osName"
				:class="
					row.available
						? selected === row.versionName
							? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-200'
							: 'border-transparent hover:border-slate-200 hover:bg-slate-50'
						: 'border-transparent opacity-50'
				"
				:disabled="!row.available"
				class="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-left transition-all duration-200 disabled:cursor-not-allowed"
				type="button"
				@click="emit('select', row.versionName)"
			>
				<div class="min-w-0 flex-1">
					<div :class="row.isLatest ? 'text-blue-700' : 'text-slate-700'" class="truncate text-xs font-semibold">
						{{ row.osName }}
					</div>
					<div class="mt-0.5 flex flex-wrap items-center gap-1">
						<span v-if="row.isLatest" class="rounded bg-blue-50 px-1 py-px text-[10px] font-medium text-blue-600">
							最新版
						</span>
						<span v-else class="rounded bg-amber-50 px-1 py-px text-[10px] font-medium text-amber-600"> 推荐 </span>
						<span class="font-mono text-[11px] text-slate-500">
							{{ row.isLatest ? row.versionName.replace(/^virtio-win-/, '') : row.versionLabel }}
						</span>
					</div>
					<div v-if="!row.available" class="mt-0.5 text-[10px] text-slate-400">归档中暂无可用版本</div>
					<div v-else-if="row.isLatest" class="mt-0.5 text-[10px] text-slate-400">推荐使用最新版</div>
					<div v-else class="mt-0.5 text-[10px] text-slate-400">该版本之后不再兼容</div>
				</div>
			</button>
		</div>
	</div>
</template>
