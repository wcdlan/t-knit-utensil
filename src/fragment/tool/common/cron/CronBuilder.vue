<script lang="ts" setup>
	import { NInput, NSelect, type SelectOption } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CronBuilderField } from '@/types/cron';

	const props = defineProps<{
		/** 各字段的构建配置 */
		fields: CronBuilderField[];
		/** 是否允许编辑（别名 / 间隔表达式不可用） */
		editable: boolean;
		/** 不可编辑时的说明 */
		disabledHint: string;
	}>();

	const emit = defineEmits<{
		/** 下拉选择某个字段的取值 */
		select: [field: CronBuilderField, value: string];
		/** 自定义输入某个字段的表达式片段 */
		input: [field: CronBuilderField, raw: string];
	}>();

	/** 转成 naive-ui 的下拉选项 */
	function toOptions(field: CronBuilderField): SelectOption[] {
		return field.options.map((option) => ({ label: option.label, value: option.value }));
	}
</script>

<template>
	<div class="space-y-3">
		<div class="flex items-center justify-between gap-3">
			<span class="text-xs font-semibold text-slate-500">选单构建（逐字段选择，表达式实时同步）</span>
			<span v-if="!props.editable" class="flex items-center gap-1 text-xs text-amber-600">
				<TkuIcon :name="icons.info" :size="14" />
				<span>{{ props.disabledHint }}</span>
			</span>
		</div>

		<!-- 字段行：左侧字段名，中间快捷选项，右侧自定义输入 -->
		<div class="space-y-2">
			<div
				v-for="field in props.fields"
				:key="field.type + field.index"
				class="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:items-center"
			>
				<!-- 字段名与取值范围 -->
				<div class="shrink-0 sm:w-24">
					<div class="text-sm font-medium text-slate-700">{{ field.label }}</div>
					<div class="text-[10px] text-slate-400">{{ field.rangeHint }}</div>
				</div>

				<!-- NSelect：该字段的常用取值 -->
				<div class="w-full sm:w-56">
					<n-select
						:disabled="!props.editable"
						:options="toOptions(field)"
						:placeholder="'自定义：' + field.token"
						:value="field.selected"
						size="small"
						@update:value="(value: string) => emit('select', field, value)"
					/>
				</div>

				<!-- NInput：自定义表达式片段（与下拉二选一，输入即生效） -->
				<div class="flex min-w-0 flex-1 items-center gap-2">
					<n-input
						:disabled="!props.editable"
						:value="field.token"
						class="!font-mono"
						placeholder="自定义片段，如 1,15 或 */5"
						size="small"
						@update:value="(value: string) => emit('input', field, value)"
					/>
					<span class="shrink-0 font-mono text-[10px] text-slate-400">#{{ field.index + 1 }}</span>
				</div>
			</div>
		</div>

		<!-- 空态：别名字段无法拆分 -->
		<div
			v-if="!props.fields.length"
			class="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<span class="text-xs text-slate-400">{{ props.disabledHint }}</span>
		</div>
	</div>
</template>
