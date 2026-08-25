<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<!-- Input section -->
	<div class="flex flex-col min-h-0">
		<div class="flex items-center justify-between mb-2 flex-shrink-0">
			<label class="text-xs font-semibold text-slate-500">JSON 输入</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<div class="relative flex-1 min-h-0 json-pane">
			<n-input
				:value="props.modelValue"
				class="h-full min-h-0"
				placeholder='粘贴 JSON 数据，例如: {"name": "test"}'
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.clipboard" :size="28" />
				</div>
				<p class="text-slate-400 text-xs">粘贴 JSON 数据后选择操作</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
	/* 让左侧输入的 textarea 撑满容器，内部滚动，随页面自适应拉伸不溢出 */
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
