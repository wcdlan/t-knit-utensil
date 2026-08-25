<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { TimestampNowKind } from '@/types/timestamp';

	const props = defineProps<{
		now: number;
		nowMs: number;
		nowStr: string;
	}>();

	const emit = defineEmits<{
		copy: [kind: TimestampNowKind];
	}>();
</script>

<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">当前时间</h3>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
			<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
				<span class="text-slate-500 text-xs">秒级时间戳</span>
				<code class="font-mono font-semibold text-blue-700 tabular-nums">{{ props.now }}</code>
				<n-button secondary size="tiny" @click="emit('copy', 'now')">复制</n-button>
			</div>
			<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
				<span class="text-slate-500 text-xs">毫秒级时间戳</span>
				<code class="font-mono font-semibold text-blue-700 tabular-nums">{{ props.nowMs }}</code>
				<n-button secondary size="tiny" @click="emit('copy', 'nowMs')">复制</n-button>
			</div>
			<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
				<span class="text-slate-500 text-xs">本地时间</span>
				<span class="font-semibold text-blue-700 tabular-nums">{{ props.nowStr }}</span>
			</div>
		</div>
	</div>
</template>
