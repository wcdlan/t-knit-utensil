<script lang="ts" setup>
	import { NInputNumber, NSelect, type SelectOption } from 'naive-ui';
	import type { FakerLocaleKey, FakerNatureCategory } from '@/types/faker';
	import LocaleSelect from '../common/LocaleSelect.vue';

	const props = defineProps<{
		locale: FakerLocaleKey;
		category: FakerNatureCategory;
		count: number;
		categoryOptions: SelectOption[];
	}>();

	const emit = defineEmits<{
		'update:locale': [value: FakerLocaleKey];
		'update:category': [value: FakerNatureCategory];
		'update:count': [value: number];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="flex flex-wrap items-center gap-4">
			<LocaleSelect :model-value="props.locale" @update:model-value="(v) => emit('update:locale', v)" />
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">类别</span>
				<n-select
					:options="props.categoryOptions"
					:value="props.category"
					class="!w-[110px] !max-w-full"
					@update:value="(v: FakerNatureCategory) => emit('update:category', v)"
				/>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">生成数量</span>
				<n-input-number
					:max="30"
					:min="1"
					:value="props.count"
					class="w-20"
					@update:value="(v: number | null) => emit('update:count', v ?? props.count)"
				/>
			</div>
		</div>
	</div>
</template>
