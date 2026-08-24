<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	defineProps<{
		label: string;
		value: string;
	}>();

	function copyValue(value: string) {
		copyToClipboard(value, '已复制 ' + (value.length > 24 ? value.slice(0, 24) + '…' : value));
	}
</script>

<template>
	<div
		class="group flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
		@click="copyValue(value)"
	>
		<div class="min-w-0">
			<div class="text-[11px] font-medium text-slate-400">{{ label }}</div>
			<div class="mt-0.5 truncate font-mono text-sm text-slate-700">{{ value }}</div>
		</div>
		<n-button class="pointer-events-none opacity-0 transition group-hover:opacity-100" secondary size="tiny">
			复制
		</n-button>
	</div>
</template>
