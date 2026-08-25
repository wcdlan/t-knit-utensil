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
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">文本内容</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<n-input
			:autosize="{ minRows: 10 }"
			:value="props.modelValue"
			placeholder="输入或粘贴文本..."
			type="textarea"
			@update:value="(v: string) => emit('update:modelValue', v)"
		/>
	</div>
</template>
