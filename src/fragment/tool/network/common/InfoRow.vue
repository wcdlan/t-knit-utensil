<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	defineProps<{
		label: string;
		value: string;
		mono?: boolean;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<div
		class="group flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
	>
		<div class="min-w-0">
			<div class="text-[11px] font-medium text-slate-400">{{ label }}</div>
			<div
				:class="mono ? 'font-mono' : ''"
				class="mt-0.5 cursor-pointer break-all text-sm font-semibold text-slate-700"
				@click="emit('copy', value)"
			>
				{{ value }}
			</div>
		</div>
		<n-button
			class="pointer-events-none shrink-0 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
			secondary
			size="tiny"
			@click="emit('copy', value)"
		>
			复制
		</n-button>
	</div>
</template>
