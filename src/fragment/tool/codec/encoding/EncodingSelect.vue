<script lang="ts" setup>
	import { NSelect } from 'naive-ui';
	import { SUPPORTED_ENCODINGS } from '@/utils/encoding';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
		<div class="flex items-center gap-3 flex-wrap">
			<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">输入编码</span>
			<n-select
				:options="SUPPORTED_ENCODINGS"
				:value="props.modelValue"
				class="!w-[190px] !max-w-full"
				placeholder="选择输入文本的原始编码"
				size="small"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
		</div>
	</div>
</template>
