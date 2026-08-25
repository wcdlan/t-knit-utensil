<script lang="ts" setup>
	import { NSelect, type SelectOption } from 'naive-ui';
	import type { HashAlgorithm } from '@/types/hash';

	const props = defineProps<{
		modelValue: HashAlgorithm;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: HashAlgorithm];
	}>();

	const options: SelectOption[] = [
		{ label: 'MD5', value: 'MD5' },
		{ label: 'SHA-1', value: 'SHA-1' },
		{ label: 'SHA-256', value: 'SHA-256' },
		{ label: 'SHA-384', value: 'SHA-384' },
		{ label: 'SHA-512', value: 'SHA-512' }
	];
</script>

<template>
	<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
		<div class="flex items-center gap-3">
			<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">哈希算法</span>
			<n-select
				:options="options"
				:value="props.modelValue"
				class="!w-[180px] !max-w-full"
				@update:value="(v: HashAlgorithm) => emit('update:modelValue', v)"
			/>
		</div>
	</div>
</template>
