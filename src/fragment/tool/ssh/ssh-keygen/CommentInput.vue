<script lang="ts" setup>
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<label class="mb-1 block text-xs font-semibold text-slate-500">注释 (可选)</label>
		<n-input
			:value="props.modelValue"
			class="max-w-[360px]"
			placeholder="user@host"
			@update:value="(v: string) => emit('update:modelValue', v)"
		/>
	</div>
</template>
