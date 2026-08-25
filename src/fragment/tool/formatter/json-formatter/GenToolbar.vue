<script lang="ts" setup>
	import { NButton, NSelect, type SelectOption } from 'naive-ui';
	import type { JsonGenMode } from '@/types/json';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		genMode: JsonGenMode;
		genModeOptions: SelectOption[];
	}>();

	const emit = defineEmits<{
		'update:genMode': [value: JsonGenMode];
		generate: [];
	}>();
</script>

<template>
	<!-- 生成随机 JSON 工具条（页面上端） -->
	<div class="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-3 flex-shrink-0">
		<span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
			<TkuIcon :name="icons.star" :size="14" />
			生成随机 JSON
		</span>
		<n-select
			:options="props.genModeOptions"
			:value="props.genMode"
			class="!w-[180px] !max-w-full"
			size="small"
			@update:value="(v) => emit('update:genMode', v as JsonGenMode)"
		/>
		<n-button size="small" type="primary" @click="emit('generate')">
			<span class="flex items-center gap-1">
				<TkuIcon :name="icons.lightning" :size="14" />
				<span>生成</span>
			</span>
		</n-button>
		<span class="text-[11px] text-slate-400 ml-auto hidden sm:inline">
			生成结果自动填入左侧输入框，可直接进行格式化 / 压缩 / 校验
		</span>
	</div>
</template>
