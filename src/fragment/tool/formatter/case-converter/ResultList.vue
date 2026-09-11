<script lang="ts" setup>
	import { NButton, NTag } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { CaseFormatId, CaseResult } from '@/types/case';

	const props = defineProps<{
		results: CaseResult[];
		matchedIds: CaseFormatId[];
	}>();

	function isMatched(id: CaseFormatId) {
		return props.matchedIds.includes(id);
	}

	function copyValue(value: string) {
		if (!value) return;
		copyToClipboard(value, '已复制 ' + (value.length > 24 ? value.slice(0, 24) + '…' : value));
	}

	function copyAll() {
		const text = props.results.map((r) => r.format.name + ': ' + r.value).join('\n');
		copyToClipboard(text, '已复制全部格式');
	}
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">转换结果</label>
			<!-- 复制全部：将各格式结果以「格式名: 结果」拼接后整体复制 -->
			<n-button :disabled="!props.results.some((r) => r.value)" secondary size="tiny" @click="copyAll">
				复制全部
			</n-button>
		</div>
		<div class="space-y-2">
			<!-- 每个格式一行：格式名 + 说明 + 转换结果（点击复制）；命中当前输入的格式高亮并标注 -->
			<div
				v-for="item in props.results"
				:key="item.format.id"
				:class="isMatched(item.format.id) ? 'border-blue-300 bg-blue-50/70' : 'border-slate-200 bg-white'"
				class="flex flex-col gap-2 rounded-lg border px-3 py-2.5 transition sm:flex-row sm:items-center sm:gap-4"
			>
				<div class="shrink-0 sm:w-56">
					<div class="flex flex-wrap items-center gap-1.5">
						<span class="font-mono text-sm font-semibold text-slate-700">{{ item.format.name }}</span>
						<n-tag v-if="isMatched(item.format.id)" :bordered="false" size="tiny" type="info"> 当前格式 </n-tag>
					</div>
					<div class="mt-0.5 text-[11px] leading-snug text-slate-400">{{ item.format.description }}</div>
				</div>
				<div
					:title="item.value || '暂无内容'"
					class="min-w-0 flex-1 cursor-pointer truncate font-mono text-sm text-slate-700 transition hover:text-blue-600"
					@click="copyValue(item.value)"
				>
					{{ item.value || '—' }}
				</div>
				<n-button :disabled="!item.value" secondary size="tiny" @click="copyValue(item.value)">复制</n-button>
			</div>
		</div>
	</div>
</template>
