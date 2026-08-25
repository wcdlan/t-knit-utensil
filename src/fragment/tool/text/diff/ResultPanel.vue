<script lang="ts" setup>
	import type { DiffLine } from '@/types/diff';

	defineProps<{
		lines: DiffLine[];
	}>();
</script>

<template>
	<div>
		<div class="flex items-center justify-between mb-2">
			<label class="text-xs font-semibold text-slate-500">对比结果</label>
		</div>
		<div
			v-if="lines.length"
			class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto font-mono text-sm"
		>
			<div
				v-for="(line, i) in lines"
				:key="i"
				:class="{
					'bg-red-50 text-red-700 border-l-3 border-red-300': line.type === 'removed',
					'bg-emerald-50 text-emerald-700 border-l-3 border-emerald-300': line.type === 'added',
					'text-slate-700': line.type === 'same'
				}"
				class="px-4 py-1.5 flex items-center gap-2"
			>
				<span class="w-5 text-center flex-shrink-0 text-xs font-medium">
					{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}
				</span>
				<span class="whitespace-pre-wrap break-words">{{ line.text || ' ' }}</span>
			</div>
		</div>
		<div v-else class="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
			<span class="text-slate-300 text-sm">输入文本后点击「对比」查看差异</span>
		</div>
	</div>
</template>
