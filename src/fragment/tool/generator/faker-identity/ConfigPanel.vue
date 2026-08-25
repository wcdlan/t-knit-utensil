<script lang="ts" setup>
	import { NInputNumber, NSelect, type SelectOption } from 'naive-ui';
	import LocaleSelect from '../common/LocaleSelect.vue';
	import type { FakerLocaleKey } from '@/types/faker';
	import type { IdentitySex } from '@/types/identity';

	const props = defineProps<{
		locale: FakerLocaleKey;
		count: number;
		sex: IdentitySex;
	}>();

	const emit = defineEmits<{
		'update:locale': [value: FakerLocaleKey];
		'update:count': [value: number];
		'update:sex': [value: IdentitySex];
	}>();

	const sexOptions: SelectOption[] = [
		{ label: '随机', value: 'any' },
		{ label: '男性', value: 'male' },
		{ label: '女性', value: 'female' }
	];
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="flex flex-wrap items-center gap-4">
			<LocaleSelect :model-value="props.locale" @update:model-value="(v: FakerLocaleKey) => emit('update:locale', v)" />
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
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">性别倾向</span>
				<n-select
					:options="sexOptions"
					:value="props.sex"
					class="!w-[110px] !max-w-full"
					@update:value="(v: IdentitySex) => emit('update:sex', v)"
				/>
			</div>
		</div>
	</div>
</template>
