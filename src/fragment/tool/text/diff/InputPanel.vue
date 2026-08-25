<script lang="ts" setup>
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		left: string;
		right: string;
	}>();

	const emit = defineEmits<{
		'update:left': [value: string];
		'update:right': [value: string];
	}>();
</script>

<template>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">原始文本</label>
				<span class="text-[10px] text-slate-400">{{ props.left.length }} 字符</span>
			</div>
			<n-input
				:autosize="{ minRows: 10 }"
				:value="props.left"
				placeholder="粘贴原始文本..."
				type="textarea"
				@update:value="(v: string) => emit('update:left', v)"
			/>
		</div>
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">对比文本</label>
				<span class="text-[10px] text-slate-400">{{ props.right.length }} 字符</span>
			</div>
			<n-input
				:autosize="{ minRows: 10 }"
				:value="props.right"
				placeholder="粘贴对比文本..."
				type="textarea"
				@update:value="(v: string) => emit('update:right', v)"
			/>
		</div>
	</div>
</template>
