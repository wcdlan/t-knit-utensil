<script lang="ts" setup>
	import { NButton, NInput, NSwitch } from 'naive-ui';

	const props = defineProps<{
		value: string;
		includeHeader: boolean;
	}>();

	const emit = defineEmits<{
		'update:includeHeader': [value: boolean];
		copy: [];
		reset: [];
	}>();
</script>

<template>
	<!-- Base64OutputPanel：Base64 结果输出区（textarea 撑满剩余高度，内部滚动） -->
	<div class="flex min-h-0 flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="mb-2 flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
			<label class="text-xs font-semibold text-slate-500">Base64 结果</label>
			<div class="flex items-center gap-3">
				<span class="flex items-center gap-1.5 text-[10px] text-slate-400">
					<span>复制时携带文件头</span>
					<n-switch
						:value="props.includeHeader"
						size="small"
						@update:value="(v: boolean) => emit('update:includeHeader', v)"
					/>
				</span>
				<span class="text-[10px] text-slate-400">{{ props.value.length }} 字符</span>
			</div>
		</div>
		<div class="relative flex-1 min-h-0 json-pane">
			<n-input
				:value="props.value"
				class="h-full min-h-0 cursor-pointer font-mono text-xs"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<div v-if="!props.value" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-slate-300 text-xs">请先上传图片生成 Base64</span>
			</div>
		</div>
		<div class="mt-3 flex flex-shrink-0 items-center gap-2">
			<n-button :disabled="!props.value" size="small" type="primary" @click="emit('copy')">复制</n-button>
			<n-button :disabled="!props.value" secondary size="small" @click="emit('reset')">重新选择图片</n-button>
		</div>
	</div>
</template>

<style scoped>
	/* 让 Base64 结果 textarea 撑满容器，内部滚动，随页面自适应拉伸不溢出 */
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
