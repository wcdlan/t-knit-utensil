<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { DateFormatItem } from '@/types/datetime';

	const props = defineProps<{
		items: DateFormatItem[];
	}>();

	const emit = defineEmits<{
		copy: [value: string];
		copyAll: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">转换结果（共 {{ props.items.length }} 种格式）</label>
			<!-- 复制全部：以「格式名：结果」逐行拼接 -->
			<n-button :disabled="!props.items.length" secondary size="tiny" @click="emit('copyAll')">复制全部</n-button>
		</div>

		<!-- 空态占位：结果区始终渲染 -->
		<div
			v-if="!props.items.length"
			class="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<span class="text-xs text-slate-400">识别成功后，各格式结果将显示在这里</span>
		</div>

		<div v-else class="space-y-1.5">
			<!-- 每个格式一行：格式名 + 值（点击复制） -->
			<div
				v-for="item in props.items"
				:key="item.id"
				class="group flex cursor-pointer flex-col gap-1 rounded-lg border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:gap-4"
				@click="emit('copy', item.value)"
			>
				<!-- 格式名与说明 -->
				<div class="shrink-0 sm:w-52">
					<div class="text-xs font-medium text-slate-700">{{ item.label }}</div>
					<div v-if="item.hint" class="mt-0.5 text-[10px] leading-snug text-slate-400">{{ item.hint }}</div>
				</div>
				<!-- 结果值 -->
				<div :title="item.value" class="min-w-0 flex-1 truncate font-mono text-sm text-blue-700">
					{{ item.value }}
				</div>
				<span class="shrink-0 text-[10px] text-slate-300 transition group-hover:text-blue-400">点击复制</span>
			</div>
		</div>
	</div>
</template>
