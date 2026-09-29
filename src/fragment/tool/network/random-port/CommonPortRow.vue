<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CommonPortEntry } from '@/types/port';

	const props = defineProps<{
		/** 常用服务端口条目 */
		entry: CommonPortEntry;
	}>();

	const emit = defineEmits<{
		copy: [value: string, successText?: string];
	}>();

	/** 详情是否展开（纯展示状态，默认折叠） */
	const expanded = ref(false);
</script>

<template>
	<div
		:class="expanded ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white hover:border-blue-200'"
		class="rounded-lg border transition"
	>
		<!-- 行摘要：端口号 + 服务名，点击展开服务介绍 -->
		<div class="flex cursor-pointer items-center gap-3 px-3 py-2" @click="expanded = !expanded">
			<span
				class="w-14 shrink-0 rounded-md bg-slate-800 px-1.5 py-0.5 text-center font-mono text-xs font-semibold tabular-nums text-white"
			>
				{{ props.entry.port }}
			</span>
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-1.5">
					<span class="truncate text-sm font-medium text-slate-700">{{ props.entry.name }}</span>
					<n-tag v-if="props.entry.hot" :bordered="false" round size="tiny" type="error">常用</n-tag>
				</div>
				<div class="truncate text-[11px] text-slate-400">{{ props.entry.service }} · {{ props.entry.protocol }}</div>
			</div>
			<TkuIcon :name="expanded ? icons.chevronDown : icons.chevronRight" :size="16" class="shrink-0 text-slate-400" />
		</div>

		<!-- 展开详情：服务介绍 + 使用与安全提示 + 复制操作 -->
		<div v-show="expanded" class="space-y-2 border-t border-slate-100 px-3 py-2.5">
			<p class="text-xs leading-relaxed text-slate-600">{{ props.entry.description }}</p>
			<p
				v-if="props.entry.note"
				class="flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs leading-relaxed text-amber-700"
			>
				<TkuIcon :name="icons.alert" :size="14" class="mt-0.5 shrink-0" />
				<span>{{ props.entry.note }}</span>
			</p>
			<div class="flex flex-wrap gap-2">
				<n-button
					secondary
					size="tiny"
					@click.stop="emit('copy', String(props.entry.port), `已复制端口 ${props.entry.port}`)"
				>
					复制端口
				</n-button>
				<n-button
					secondary
					size="tiny"
					@click.stop="
						emit(
							'copy',
							`${props.entry.service} ${props.entry.port}`,
							`已复制 ${props.entry.service} ${props.entry.port}`
						)
					"
				>
					复制「服务名 端口」
				</n-button>
			</div>
		</div>
	</div>
</template>
