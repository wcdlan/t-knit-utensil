<script lang="ts" setup>
	import { NTag } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { KeyHistoryEntry } from '@/types/keyboard';

	const props = defineProps<{
		history: KeyHistoryEntry[];
	}>();

	/** 点击历史行复制该按键的组合键描述 */
	function copyEntry(entry: KeyHistoryEntry) {
		copyToClipboard(entry.combo, '已复制 ' + entry.combo);
	}
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">输入历史</label>
			<span class="text-[10px] text-slate-400">最近 {{ props.history.length }} 条（点击复制）</span>
		</div>

		<!-- 空态占位：结果区始终渲染 -->
		<div
			v-if="!props.history.length"
			class="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<span class="text-xs text-slate-400">按键记录将显示在这里</span>
		</div>

		<!-- 历史列表：最新记录在最前 -->
		<div v-else class="max-h-72 space-y-1.5 overflow-y-auto pr-1">
			<div
				v-for="entry in props.history"
				:key="entry.id"
				class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 transition hover:bg-blue-50/60"
				@click="copyEntry(entry)"
			>
				<!-- 时刻 -->
				<span class="shrink-0 font-mono text-[10px] text-slate-400">{{ entry.time }}</span>
				<!-- 组合键 -->
				<span class="min-w-0 flex-1 truncate font-mono text-xs font-medium text-slate-700">{{ entry.combo }}</span>
				<!-- 长按重复标记 -->
				<n-tag v-if="entry.repeat" :bordered="false" size="tiny" type="warning">重复</n-tag>
				<!-- code 与 keyCode -->
				<span class="shrink-0 font-mono text-[10px] text-slate-400">{{ entry.code }}</span>
				<span class="shrink-0 font-mono text-[10px] text-slate-300">#{{ entry.keyCode }}</span>
			</div>
		</div>
	</div>
</template>
