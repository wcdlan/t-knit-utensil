<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { HashAlgorithm } from '@/types/hash';

	const props = defineProps<{
		output: string;
		algorithm: HashAlgorithm;
	}>();

	const emit = defineEmits<{
		copy: [];
	}>();
</script>

<template>
	<div>
		<div class="flex items-center justify-between mb-2">
			<label class="text-xs font-semibold text-slate-500">哈希结果 ({{ props.algorithm }})</label>
			<n-button :disabled="!props.output" secondary size="tiny" @click="emit('copy')">复制</n-button>
		</div>
		<div
			class="p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition hover:bg-slate-100"
			@click="emit('copy')"
		>
			<code v-if="props.output" class="text-sm font-mono text-slate-700 break-all leading-relaxed">{{
				props.output
			}}</code>
			<span v-else class="text-sm text-slate-400">输入文本后点击「计算哈希」生成结果</span>
		</div>
	</div>
</template>
