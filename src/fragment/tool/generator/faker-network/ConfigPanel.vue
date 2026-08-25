<script lang="ts" setup>
	import { NCheckbox, NInputNumber } from 'naive-ui';
	import LocaleSelect from '../common/LocaleSelect.vue';
	import type { FakerLocaleKey } from '@/types/faker';

	const props = defineProps<{
		count: number;
		withDevice: boolean;
		locale: FakerLocaleKey;
	}>();

	const emit = defineEmits<{
		'update:count': [value: number];
		'update:withDevice': [value: boolean];
		'update:locale': [value: FakerLocaleKey];
	}>();
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
			<n-checkbox :checked="props.withDevice" @update:checked="(v: boolean) => emit('update:withDevice', v)">
				包含浏览器 UA
			</n-checkbox>
		</div>
	</div>
</template>
