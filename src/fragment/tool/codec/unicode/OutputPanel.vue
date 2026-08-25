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
			<div class="flex items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
				<n-button :disabled="!output" secondary size="tiny" @click="emit('copy')">复制</n-button>
			</div>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 6, maxRows: 16 }"
				:value="output"
				class="cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<!-- 无结果占位层 -->
			<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-slate-300 text-xs">结果将自动显示在这里</span>
			</div>
		</div>
	</div>
</template>
