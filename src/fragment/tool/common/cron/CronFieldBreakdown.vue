<script lang="ts" setup>
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
	<!-- CronFieldBreakdown：逐字段拆解（自然语言描述由 CronDescriptionPanel 单独占一行展示） -->
	<div>
		<!-- 字段明细 -->
		<div v-if="props.parsed.fields.length">
			<div class="mb-2 flex items-center justify-between gap-3">
				<span class="text-xs font-semibold text-slate-500">字段拆解</span>
				<span class="text-[10px] text-slate-400">共 {{ props.parsed.fields.length }} 段 · 点击行可复制</span>
			</div>

			<div class="space-y-1.5">
				<!-- 每个字段一行：字段名与原文同行，下方为该字段语义 -->
				<div
					v-for="field in props.parsed.fields"
					:key="field.type"
					class="group cursor-pointer rounded-lg border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50"
					@click="emit('copy', field.token)"
				>
					<div class="flex items-center gap-2">
						<span class="shrink-0 text-xs font-medium text-slate-700">{{ field.label }}</span>
						<span class="min-w-0 truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
							{{ field.token }}
						</span>
					</div>
					<div class="mt-1 flex items-center justify-between gap-2">
						<span class="min-w-0 text-xs text-slate-600">{{ field.description }}</span>
						<span class="shrink-0 text-[10px] whitespace-nowrap text-slate-400">
							<span v-if="field.count > 0">{{ field.count }} 个值</span>
							<span v-else>动态规则</span>
						</span>
					</div>
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

		<!-- 表达式有误：错误详情由 CronDescriptionPanel 展示，这里给出占位保持结构稳定 -->
		<div
			v-else
			class="flex h-20 items-center justify-center rounded-lg border border-dashed border-rose-200 bg-rose-50/40"
		>
			<span class="text-xs text-rose-400">表达式解析通过后，将展示各字段的拆解明细</span>
		</div>
	</div>
</template>
