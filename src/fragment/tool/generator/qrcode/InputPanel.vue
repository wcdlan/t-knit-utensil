<script lang="ts" setup>
	import { NInput, NSelect, type SelectOption } from 'naive-ui';

	const props = defineProps<{
		text: string;
		size: number;
	}>();

	const emit = defineEmits<{
		'update:text': [value: string];
		'update:size': [value: number];
	}>();

	const sizeOptions: SelectOption[] = [
		{ label: '150 x 150', value: 150 },
		{ label: '200 x 200', value: 200 },
		{ label: '300 x 300', value: 300 },
		{ label: '400 x 400', value: 400 }
	];
</script>

<template>
	<div class="p-5 bg-slate-50/50 rounded-xl border border-slate-100">
		<div class="flex flex-col sm:flex-row gap-4 items-end">
			<div class="flex-1 w-full">
				<label class="block text-xs font-semibold text-slate-500 mb-2">内容</label>
				<n-input
					:autosize="{ minRows: 3, maxRows: 6 }"
					:value="props.text"
					placeholder="输入文本或网址..."
					type="textarea"
					@update:value="(v: string) => emit('update:text', v)"
				/>
			</div>
			<div class="w-full sm:w-auto">
				<label class="block text-xs font-semibold text-slate-500 mb-2">尺寸</label>
				<n-select
					:options="sizeOptions"
					:value="props.size"
					class="!w-[140px] !max-w-full"
					@update:value="(v: number) => emit('update:size', v)"
				/>
			</div>
		</div>
	</div>
</template>
