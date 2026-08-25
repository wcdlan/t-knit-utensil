<script lang="ts" setup>
	const ACCENTS = {
		blue: { bg: 'bg-blue-50', border: 'border-blue-100', value: 'text-blue-600', label: 'text-blue-500' },
		emerald: {
			bg: 'bg-emerald-50',
			border: 'border-emerald-100',
			value: 'text-emerald-600',
			label: 'text-emerald-500'
		},
		purple: { bg: 'bg-purple-50', border: 'border-purple-100', value: 'text-purple-600', label: 'text-purple-500' },
		orange: { bg: 'bg-orange-50', border: 'border-orange-100', value: 'text-orange-600', label: 'text-orange-500' },
		pink: { bg: 'bg-pink-50', border: 'border-pink-100', value: 'text-pink-600', label: 'text-pink-500' },
		indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', value: 'text-indigo-600', label: 'text-indigo-500' },
		teal: { bg: 'bg-teal-50', border: 'border-teal-100', value: 'text-teal-600', label: 'text-teal-500' },
		slate: { bg: 'bg-slate-50', border: 'border-slate-200', value: 'text-slate-600', label: 'text-slate-500' },
		placeholder: {
			bg: 'bg-slate-50',
			border: 'border-slate-100',
			value: 'text-slate-300',
			label: 'text-slate-300'
		}
	} as const;

	const props = defineProps<{
		value: number;
		label: string;
		accent: keyof typeof ACCENTS;
	}>();
</script>

<template>
	<div :class="[ACCENTS[props.accent].bg, ACCENTS[props.accent].border]" class="rounded-xl border p-4 text-center">
		<div :class="ACCENTS[props.accent].value" class="text-2xl font-bold tabular-nums">{{ props.value }}</div>
		<div :class="ACCENTS[props.accent].label" class="mt-1 text-xs">{{ props.label }}</div>
	</div>
</template>
