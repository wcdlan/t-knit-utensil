<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { describeSyntax } from '@/utils/cron';
	import type { CronParseResult } from '@/types/cron';

	const props = defineProps<{
		/** 解析结果 */
		parsed: CronParseResult;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();

	/** 书写风格说明，如「5 段式：分 时 日 月 周」 */
	const syntaxText = computed(() => describeSyntax(props.parsed.syntax, props.parsed.hasSeconds, props.parsed.hasYear));
</script>

<template>
	<!-- CronDescriptionPanel：自然语言描述，占满整行、文本居中；下方补充书写风格与表达式标识 -->
	<div
		:class="
			props.parsed.ok
				? 'border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50/70 to-white'
				: 'border-rose-100 bg-gradient-to-br from-rose-50 to-white'
		"
		class="rounded-2xl border p-6"
	>
		<!-- 卡片标题行：图标 + 标题 + 复制按钮 -->
		<div class="mb-4 flex items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<span
					:class="props.parsed.ok ? 'bg-blue-100/80 text-blue-600' : 'bg-rose-100 text-rose-600'"
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
				>
					<TkuIcon :name="props.parsed.ok ? icons.textFormat : icons.info" :size="16" />
				</span>
				<span :class="props.parsed.ok ? 'text-blue-800' : 'text-rose-700'" class="text-xs font-semibold">
					{{ props.parsed.ok ? '自然语言描述' : '表达式有误' }}
				</span>
			</div>
			<!-- 复制归一化后的表达式（消除多余空格） -->
			<n-button
				v-if="props.parsed.ok && props.parsed.normalized"
				quaternary
				size="tiny"
				@click="emit('copy', props.parsed.normalized)"
			>
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.clipboard" :size="14" />
					<span>复制表达式</span>
				</span>
			</n-button>
		</div>

		<!-- 主描述 / 错误列表：居中且占满整行 -->
		<div v-if="props.parsed.ok" class="px-2 py-3 text-center">
			<p class="text-2xl leading-snug font-semibold tracking-tight text-slate-800">
				{{ props.parsed.description }}
			</p>
		</div>
		<div v-else class="space-y-1.5 px-2 py-3 text-center">
			<p v-for="(error, index) in props.parsed.errors" :key="index" class="text-sm text-rose-700">
				{{ error }}
			</p>
		</div>

		<!-- 标识区：书写风格 + 归一化表达式（点击可复制） -->
		<div v-if="props.parsed.ok" class="mt-4 flex flex-wrap items-center justify-center gap-2">
			<span class="rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-medium text-blue-700">
				{{ syntaxText }}
			</span>
			<button
				v-if="props.parsed.normalized"
				:title="'点击复制 ' + props.parsed.normalized"
				class="cursor-pointer rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-mono text-xs text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
				type="button"
				@click="emit('copy', props.parsed.normalized)"
			>
				{{ props.parsed.normalized }}
			</button>
		</div>
	</div>
</template>
