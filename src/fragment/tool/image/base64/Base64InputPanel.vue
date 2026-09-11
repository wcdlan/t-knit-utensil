<script lang="ts" setup>
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
		convert: [];
		reset: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">粘贴图片 Base64</label>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 8, maxRows: 16 }"
				:value="props.modelValue"
				class="font-mono text-xs"
				placeholder="粘贴 data:image/png;base64,... 或纯 Base64 内容"
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
		</div>
	</div>
</template>
