<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NSelect, type SelectOption } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { TimezoneOption } from '@/types/datetime';

	const props = defineProps<{
		/** 输入时区：解释不带时区标记的输入 */
		inputZone: string;
		/** 目标时区：输出展示所用时区 */
		targetZone: string;
		/** 可选时区列表 */
		options: TimezoneOption[];
		/** 本地时区（用于「使用本地时区」按钮） */
		localZone: string;
	}>();

	const emit = defineEmits<{
		'update:inputZone': [value: string];
		'update:targetZone': [value: string];
		swap: [];
		useLocal: [];
	}>();

	/** 转换为 naive-ui 下拉选项类型（TimezoneOption 结构相同，仅用于满足组件类型约束） */
	const selectOptions = computed<SelectOption[]>(() =>
		props.options.map((option) => ({ label: option.label, value: option.value }))
	);
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">时区设置</span>
			<!-- 使用本地时区：输入与目标时区同时重置为当前系统时区 -->
			<n-button secondary size="tiny" @click="emit('useLocal')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.refresh" :size="14" />
					<span>使用本地时区（{{ props.localZone }}）</span>
				</span>
			</n-button>
		</div>

		<div class="flex flex-wrap items-end gap-3">
			<!-- 输入时区 -->
			<div class="min-w-[14rem] flex-1">
				<label class="mb-1 block text-xs font-semibold text-slate-500">输入时区（解释不带时区的输入）</label>
				<n-select
					:filterable="true"
					:options="selectOptions"
					:value="props.inputZone"
					@update:value="(v: string) => emit('update:inputZone', v)"
				/>
			</div>

			<!-- 互换输入 / 目标时区 -->
			<n-button class="mb-0.5" secondary @click="emit('swap')">
				<span class="flex items-center gap-1.5">
					<span>&#8596;</span>
					<span>互换</span>
				</span>
			</n-button>

			<!-- 目标时区 -->
			<div class="min-w-[14rem] flex-1">
				<label class="mb-1 block text-xs font-semibold text-slate-500">目标时区（输出展示时区）</label>
				<n-select
					:filterable="true"
					:options="selectOptions"
					:value="props.targetZone"
					@update:value="(v: string) => emit('update:targetZone', v)"
				/>
			</div>
		</div>
	</div>
</template>
