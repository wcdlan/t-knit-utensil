<script lang="ts" setup>
	import { NSelect, type SelectOption } from 'naive-ui';
	import { icons } from '@/data/icons';
	import { FAKER_LOCALE_OPTIONS } from '@/utils/fakerLocales';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { FakerLocaleKey } from '@/types/faker';

	const props = defineProps<{
		modelValue: FakerLocaleKey;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: FakerLocaleKey];
	}>();

	const options: SelectOption[] = FAKER_LOCALE_OPTIONS.map((o) => ({ label: o.label, value: o.value }));
</script>

<template>
	<div class="flex flex-wrap items-center gap-2">
		<span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
			<TkuIcon :name="icons.translate" :size="14" />
			生成语言
		</span>
		<n-select
			:options="options"
			:value="props.modelValue"
			class="!w-[220px] !max-w-full"
			size="small"
			@update:value="(v: FakerLocaleKey) => emit('update:modelValue', v)"
		/>
	</div>
</template>
