<script lang="ts" setup>
	import { NInputNumber, NSelect, type SelectOption } from 'naive-ui';
	import LocaleSelect from '../common/LocaleSelect.vue';
	import type { FakerLocaleKey } from '@/types/faker';
	import type { TextMode } from '@/types/faker-text';

	const props = defineProps<{
		locale: FakerLocaleKey;
		mode: TextMode;
		count: number;
	}>();

	const emit = defineEmits<{
		'update:locale': [value: FakerLocaleKey];
		'update:mode': [value: TextMode];
		'update:count': [value: number];
	}>();

	const modeOptions: SelectOption[] = [
		{ label: '单词', value: 'word' },
		{ label: '句子', value: 'sentence' },
		{ label: '段落', value: 'paragraph' },
		{ label: '短横线形式 (slug)', value: 'slug' }
	];
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="flex flex-wrap items-center gap-4">
			<LocaleSelect :model-value="props.locale" @update:model-value="(v: FakerLocaleKey) => emit('update:locale', v)" />
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">文本类型</span>
				<n-select
					:options="modeOptions"
					:value="props.mode"
					class="!w-[150px] !max-w-full"
					@update:value="(v: TextMode) => emit('update:mode', v)"
				/>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">生成数量</span>
				<n-input-number
					:max="20"
					:min="1"
					:value="props.count"
					class="w-20"
					@update:value="(v: number | null) => emit('update:count', v ?? 1)"
				/>
			</div>
		</div>
	</div>
</template>
