<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { FileSizeRow, FileSizeUnitId } from '@/types/filesize';

	const props = defineProps<{
		/** 各量级的换算结果（十进制 / 二进制两列） */
		rows: FileSizeRow[];
		/** 当前输入单位（用于高亮所在列） */
		activeUnit: FileSizeUnitId;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
		copyAll: [];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-sm font-semibold text-slate-800">量级换算表</h3>
			<div class="flex items-center gap-2">
				<span class="text-xs text-slate-400">点击数值即复制</span>
				<!-- 复制全部：制表符分隔，便于粘贴到表格 -->
				<n-button secondary size="tiny" @click="emit('copyAll')">复制全部</n-button>
			</div>
		</div>

		<!-- 表头：量级 + 十进制（1000） / 二进制（1024） -->
		<!-- 表头：窄屏下允许换行，避免文字被裁掉 -->
		<div
			class="grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1 pb-1.5 text-[11px] font-medium text-slate-400 sm:grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)]"
		>
			<span>量级</span>
			<span class="text-right">十进制（1000 进制）</span>
			<span class="text-right">二进制（1024 进制）</span>
		</div>

		<div
			v-for="row in props.rows"
			:key="row.label"
			class="grid grid-cols-[44px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1 border-t border-slate-100 py-1.5 sm:grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)]"
		>
			<span class="text-xs font-semibold text-slate-500">{{ row.label }}</span>
			<!-- 十进制列：数值与单位分行换行，保证长数字完整可见 -->
			<div
				:class="row.decimalId === props.activeUnit ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:text-blue-600'"
				:title="`点击复制：${row.decimal} ${row.decimalUnit}`"
				class="cursor-pointer break-words rounded px-1.5 py-0.5 text-right font-mono text-xs sm:text-sm"
				@click="emit('copy', `${row.decimal} ${row.decimalUnit}`)"
			>
				{{ row.decimal }} <span class="whitespace-nowrap text-xs text-slate-400">{{ row.decimalUnit }}</span>
			</div>
			<!-- 二进制列：比特与字节不区分进制，显示占位符 -->
			<div
				v-if="row.binaryId === row.decimalId"
				class="rounded px-1.5 py-0.5 text-right font-mono text-xs text-slate-300 sm:text-sm"
				title="比特与字节不区分进制"
			>
				—
			</div>
			<div
				v-else
				:class="row.binaryId === props.activeUnit ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:text-blue-600'"
				:title="`点击复制：${row.binary} ${row.binaryUnit}`"
				class="cursor-pointer break-words rounded px-1.5 py-0.5 text-right font-mono text-xs sm:text-sm"
				@click="emit('copy', `${row.binary} ${row.binaryUnit}`)"
			>
				{{ row.binary }} <span class="whitespace-nowrap text-xs text-slate-400">{{ row.binaryUnit }}</span>
			</div>
		</div>

		<p class="mt-2 text-[11px] leading-relaxed text-slate-400">
			同一量级下，二进制单位（KiB / MiB / GiB…）的数值总是小于十进制单位（KB / MB / GB…）：1 MiB = 1.048576 MB。
		</p>
	</div>
</template>
