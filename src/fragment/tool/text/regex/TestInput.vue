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
		<label class="block text-xs font-semibold text-slate-500 mb-2">测试文本</label>
		<n-input
			:autosize="{ minRows: 6 }"
			:value="props.modelValue"
			placeholder="输入要测试的文本..."
			type="textarea"
			@update:value="(v: string) => emit('update:modelValue', v)"
		/>
	</div>
</template>
