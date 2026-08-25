<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	defineProps<{
		output: string;
	}>();

	const emit = defineEmits<{
		copy: [];
	}>();
</script>

<template>
	<div>
		<div class="flex items-center justify-between mb-2">
			<label class="text-xs font-semibold text-slate-500">输出结果</label>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
				<n-button :disabled="!output" secondary size="tiny" @click="emit('copy')">复制</n-button>
			</div>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 10, maxRows: 24 }"
				:value="output"
				class="cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-slate-300 text-xs">输入 SQL 语句后选择操作</span>
			</div>
		</div>
	</div>
</template>
