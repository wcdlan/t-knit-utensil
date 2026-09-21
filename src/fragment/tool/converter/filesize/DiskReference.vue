<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { FileSizeReferenceRow } from '@/types/filesize';

	const props = defineProps<{
		/** 标称容量对照行（厂商标称 → 系统显示） */
		rows: FileSizeReferenceRow[];
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.harddisk" :size="16" class="text-blue-500" />
				<h3 class="text-sm font-semibold text-slate-800">硬盘标称容量对照</h3>
			</div>
			<span class="text-xs text-slate-400">点击数值即复制</span>
		</div>

		<!-- 容量卡片：标称容量 → 系统显示值，附精确字节数，宽屏自动分栏避免数值被截断 -->
		<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			<div
				v-for="row in props.rows"
				:key="row.label"
				class="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
			>
				<div class="text-xs font-semibold text-slate-500">{{ row.label }}</div>
				<!-- 系统显示值：点击即复制 -->
				<div
					:title="`点击复制：${row.binary}`"
					class="mt-0.5 cursor-pointer font-mono text-lg font-bold leading-tight text-blue-600 hover:text-blue-700"
					@click="emit('copy', row.binary)"
				>
					{{ row.binary }}
				</div>
				<!-- 精确字节数：点击即复制 -->
				<div
					:title="`点击复制：${row.bytes} B`"
					class="mt-0.5 cursor-pointer break-all font-mono text-[11px] text-slate-400 hover:text-blue-600"
					@click="emit('copy', `${row.bytes} B`)"
				>
					{{ row.bytes }} B
				</div>
			</div>
		</div>

		<p class="mt-2 text-[11px] leading-relaxed text-slate-400">
			厂商按 1000 进制标称、系统按 1024 进制显示，因此系统显示值约为标称容量的
			93.13%（容量越大比例相同，并非硬盘缺斤少两）。
		</p>
	</div>
</template>
