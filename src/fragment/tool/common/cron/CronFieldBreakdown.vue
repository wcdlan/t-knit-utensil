<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CronParseResult } from '@/types/cron';

	const props = defineProps<{
		/** 解析结果 */
		parsed: CronParseResult;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<div class="space-y-4">
		<!-- 语义总述：解析成功时展示中文描述 -->
		<div
			:class="
				props.parsed.ok
					? 'border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50'
					: 'border-rose-100 bg-rose-50/60'
			"
			class="rounded-xl border p-4"
		>
			<div class="mb-1.5 flex items-center justify-between gap-2">
				<span :class="props.parsed.ok ? 'text-blue-800' : 'text-rose-700'" class="text-xs font-semibold">
					{{ props.parsed.ok ? '自然语言描述' : '表达式有误' }}
				</span>
				<!-- 复制归一化后的表达式（消除多余空格） -->
				<n-button
					v-if="props.parsed.ok && props.parsed.normalized"
					quaternary
					size="tiny"
					@click="emit('copy', props.parsed.normalized)"
				>
					复制表达式
				</n-button>
			</div>

			<p v-if="props.parsed.ok" class="text-base leading-relaxed font-medium text-slate-800">
				{{ props.parsed.description }}
			</p>
			<ul v-else class="list-inside list-disc space-y-1 text-sm text-rose-700">
				<li v-for="(error, index) in props.parsed.errors" :key="index">{{ error }}</li>
			</ul>
		</div>

		<!-- 字段明细 -->
		<div v-if="props.parsed.fields.length">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500">字段拆解（共 {{ props.parsed.fields.length }} 段）</span>
				<span class="text-[10px] text-slate-400">点击任意一行可复制该字段片段</span>
			</div>

			<div class="space-y-1.5">
				<!-- 每个字段一行：字段名 + 原文 + 匹配数量 + 语义 -->
				<div
					v-for="field in props.parsed.fields"
					:key="field.type"
					class="group flex cursor-pointer flex-col gap-1 rounded-lg border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:gap-4"
					@click="emit('copy', field.token)"
				>
					<div class="shrink-0 sm:w-20">
						<span class="text-xs font-medium text-slate-700">{{ field.label }}</span>
					</div>
					<div class="shrink-0 sm:w-32">
						<span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
							{{ field.token }}
						</span>
					</div>
					<div class="min-w-0 flex-1 text-xs text-slate-600">
						{{ field.description }}
					</div>
					<div class="shrink-0 text-[10px] text-slate-400">
						<span v-if="field.count > 0">匹配 {{ field.count }} 个值</span>
						<span v-else>动态规则</span>
					</div>
					<TkuIcon :name="icons.clipboard" :size="13" class="hidden shrink-0 text-slate-300 group-hover:block" />
				</div>
			</div>
		</div>

		<!-- 别名表达式说明 -->
		<div
			v-else-if="props.parsed.ok"
			class="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
		>
			<TkuIcon :name="icons.info" :size="15" class="mt-0.5 shrink-0 text-slate-400" />
			<span class="text-xs leading-relaxed text-slate-500">
				这是别名 / 间隔写法，没有可拆解的字段。可在「常用列表」页签载入等价的普通写法再逐字段编辑。
			</span>
		</div>
	</div>
</template>
