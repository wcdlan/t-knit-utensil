<script lang="ts" setup>
	import { NTag } from 'naive-ui';

	const ACCENTS = {
		blue: 'info',
		emerald: 'success',
		orange: 'warning',
		red: 'error',
		gray: 'default'
	} as const;

	defineProps<{
		label: string;
		value: string;
		accent?: keyof typeof ACCENTS;
	}>();
</script>

<template>
	<div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
		<span class="text-[11px] font-medium text-slate-400">{{ label }}</span>
		<n-tag :type="ACCENTS[accent ?? 'gray']" round size="small">
			{{ value }}
		</n-tag>
	</div>
</template>
