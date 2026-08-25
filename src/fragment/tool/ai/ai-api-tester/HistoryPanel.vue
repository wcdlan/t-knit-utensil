<script lang="ts" setup>
	import { NButton, NPopover } from 'naive-ui';
	import { AI_PRESETS } from '@/utils/aiApi';
	import type { HistoryItem } from '@/types/ai';

	defineProps<{
		historyList: HistoryItem[];
		hasApiKey: boolean;
	}>();

	const emit = defineEmits<{
		save: [];
		clearAll: [];
		apply: [item: HistoryItem];
		delete: [id: string];
	}>();
</script>

<template>
	<section>
		<div class="mb-3 flex items-center justify-between">
			<h2 class="inline-flex items-center gap-1 text-lg font-semibold text-gray-800">
				历史记录
				<n-popover placement="top" trigger="hover">
					<template #trigger>
						<span
							class="inline-flex h-3.5 w-3.5 cursor-pointer select-none items-center justify-center rounded-full bg-gray-300 text-[9px] font-bold leading-none text-white"
							>!</span
						>
					</template>
					<span>数据存储在客户端本地，放心使用</span>
				</n-popover>
			</h2>
			<div class="flex gap-2">
				<n-button :disabled="!hasApiKey" size="small" type="success" @click="emit('save')"> 保存当前 </n-button>
				<n-button v-if="historyList.length" secondary size="small" type="error" @click="emit('clearAll')">
					清空全部
				</n-button>
			</div>
		</div>

		<div v-if="historyList.length === 0" class="text-sm italic text-gray-400">
			暂无历史记录，填写配置后点击「保存当前」
		</div>
		<div v-else class="max-h-52 space-y-2 overflow-y-auto">
			<div
				v-for="item in historyList"
				:key="item.id"
				class="group flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50/50"
			>
				<button
					class="min-w-0 flex-1 truncate text-left text-sm text-gray-700"
					title="点击加载此配置"
					@click="emit('apply', item)"
				>
					<span class="font-medium">{{ AI_PRESETS[item.preset]?.label ?? item.preset }}</span>
					<span class="mx-1 text-gray-300">|</span>
					<span class="font-mono text-xs text-gray-500">{{ item.baseUrl.replace(/^https?:\/\//, '') }}</span>
					<span class="ml-2 text-xs text-gray-400">{{ new Date(item.createdAt).toLocaleString('zh-CN') }}</span>
				</button>
				<n-button
					class="shrink-0 opacity-0 transition group-hover:opacity-100"
					size="tiny"
					text
					type="error"
					@click="emit('delete', item.id)"
				>
					×
				</n-button>
			</div>
		</div>
	</section>
</template>
