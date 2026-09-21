<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { FileSizeSummaryItem } from '@/types/filesize';

	const props = defineProps<{
		/** 摘要指标行（字节 / 比特 / 两种进制的最简表示） */
		items: FileSizeSummaryItem[];
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex items-center gap-2">
			<TkuIcon :name="icons.ruler" :size="16" class="text-blue-500" />
			<h3 class="text-sm font-semibold text-slate-800">基准值</h3>
		</div>

		<div class="grid gap-2 sm:grid-cols-2">
			<div
				v-for="item in props.items"
				:key="item.label"
				:title="item.hint"
				class="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
			>
				<div class="text-xs font-semibold text-slate-500">{{ item.label }}</div>
				<!-- 数值：点击即复制 -->
				<div
					:class="item.mono ? 'font-mono' : ''"
					:title="`点击复制：${item.value}`"
					class="mt-0.5 cursor-pointer break-all text-sm font-semibold text-slate-700 hover:text-blue-600"
					@click="emit('copy', item.value)"
				>
					{{ item.value }}
				</div>
				<div v-if="item.hint" class="mt-0.5 text-[11px] text-slate-400">{{ item.hint }}</div>
			</div>
		</div>
	</div>
</template>
