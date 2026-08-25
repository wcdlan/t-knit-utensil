<script lang="ts" setup>
	import type { DiffStats } from '@/types/diff';

	defineProps<{
		stats: DiffStats | null;
	}>();
</script>

<template>
	<div v-if="stats" class="flex items-center gap-4 text-sm">
		<span class="flex items-center gap-1.5">
			<span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
			<span class="text-slate-600">{{ stats.same }} 行未变</span>
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
			<span class="text-slate-600">{{ stats.added }} 行新增</span>
		</span>
		<span class="flex items-center gap-1.5">
			<span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
			<span class="text-slate-600">{{ stats.removed }} 行删除</span>
		</span>
	</div>
</template>
