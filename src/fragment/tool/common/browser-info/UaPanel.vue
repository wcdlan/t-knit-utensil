<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	const props = defineProps<{
		ua: string;
	}>();

	const emit = defineEmits<{
		copy: [];
	}>();
</script>

<template>
	<!-- User-Agent 原文面板：只读展示 + 一键复制 -->
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">User-Agent 原文</label>
			<div class="flex items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ props.ua.length }} 字符</span>
				<n-button secondary size="tiny" @click="emit('copy')">复制</n-button>
			</div>
		</div>
		<n-input
			:autosize="{ minRows: 3, maxRows: 8 }"
			:input-props="{ class: 'font-mono text-xs' }"
			:value="props.ua"
			class="cursor-pointer"
			readonly
			type="textarea"
			@click="emit('copy')"
		/>
	</div>
</template>
