<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	const props = defineProps<{
		output: string;
	}>();

	const emit = defineEmits<{
		copy: [];
	}>();
</script>

<template>
	<!-- 输出区 -->
	<div class="flex flex-col min-h-0">
		<div class="flex items-center justify-between mb-2 flex-shrink-0">
			<label class="text-xs font-semibold text-slate-500">输出结果</label>
			<div class="flex items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ props.output.length }} 字符</span>
				<n-button :disabled="!props.output" secondary size="tiny" @click="emit('copy')">复制</n-button>
			</div>
		</div>
		<div class="relative flex-1 min-h-0 json-pane">
			<n-input
				:value="props.output"
				class="h-full min-h-0 cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<div v-if="!props.output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-slate-300 text-xs">粘贴 JSON 数据后点击操作按钮</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
	/* 让右侧输出的 textarea 撑满容器，内部滚动，随页面自适应拉伸不溢出 */
	.json-pane :deep(.n-input),
	.json-pane :deep(.n-input-wrapper),
	.json-pane :deep(.n-input__textarea),
	.json-pane :deep(.n-input__textarea .n-scrollbar),
	.json-pane :deep(.n-input__textarea .n-scrollbar-container),
	.json-pane :deep(.n-input__textarea .n-scrollbar-content) {
		height: 100%;
	}

	.json-pane :deep(.n-input) {
		display: flex;
		flex-direction: column;
	}

	.json-pane :deep(.n-input-wrapper) {
		flex: 1;
	}
</style>
