<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	const props = defineProps<{
		output: string;
		error: string;
	}>();

	const emit = defineEmits<{
		copy: [];
		swap: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">转换结果</label>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
				<n-button :disabled="!output" secondary size="tiny" @click="emit('swap')">互换</n-button>
				<n-button :disabled="!output" secondary size="tiny" @click="emit('copy')">复制</n-button>
			</div>
		</div>
		<!-- 解码失败提示 -->
		<div v-if="error" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
			{{ error }}
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 6, maxRows: 16 }"
				:input-props="{ class: 'font-mono text-xs' }"
				:value="output"
				class="cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<!-- 空态占位：结果区始终渲染 -->
			<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-xs text-slate-300">结果将显示在这里</span>
			</div>
		</div>
	</div>
</template>
