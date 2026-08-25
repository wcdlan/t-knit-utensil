<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { EncodingResult } from '@/types/encoding';

	defineProps<{
		results: EncodingResult[];
		sourceEncoding: string;
	}>();

	const emit = defineEmits<{
		copy: [text: string];
	}>();
</script>

<template>
	<div>
		<div class="flex items-center gap-2 mb-3">
			<label class="text-xs font-semibold text-slate-500">转换结果</label>
			<span class="text-[10px] text-slate-400">共 {{ results.length }} 种编码</span>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			<div
				v-for="result in results"
				:key="result.encoding"
				class="bg-slate-50/80 rounded-lg border border-slate-100 p-3 space-y-2"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-semibold text-slate-700">{{ result.label }}</span>
						<span
							v-if="result.encoding === sourceEncoding"
							class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium"
						>
							原始
						</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="text-[10px] text-slate-400">{{ result.text.length }} 字符</span>
						<n-button secondary size="tiny" @click="emit('copy', result.text)">复制</n-button>
					</div>
				</div>
				<div
					class="text-sm font-mono text-slate-600 bg-white rounded border border-slate-100 p-2 min-h-[2rem] max-h-[6rem] overflow-y-auto whitespace-pre-wrap break-all cursor-pointer transition hover:bg-blue-50/40"
					@click="emit('copy', result.text)"
				>
					{{ result.text || '(空)' }}
				</div>
			</div>
		</div>
	</div>
</template>
