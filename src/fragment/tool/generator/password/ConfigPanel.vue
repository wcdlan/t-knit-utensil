<script lang="ts" setup>
	import { NCheckbox, NInputNumber } from 'naive-ui';

	const props = defineProps<{
		length: number;
		count: number;
		upper: boolean;
		lower: boolean;
		numbers: boolean;
		symbols: boolean;
	}>();

	const emit = defineEmits<{
		'update:length': [value: number];
		'update:count': [value: number];
		'update:upper': [value: boolean];
		'update:lower': [value: boolean];
		'update:numbers': [value: boolean];
		'update:symbols': [value: boolean];
	}>();
</script>

<template>
	<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
		<span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">生成配置</span>
		<div class="flex flex-wrap gap-4 items-end">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">密码长度</label>
				<n-input-number
					:max="128"
					:min="4"
					:value="props.length"
					class="w-20"
					@update:value="(v: number | null) => emit('update:length', v ?? props.length)"
				/>
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">生成数量</label>
				<n-input-number
					:max="50"
					:min="1"
					:value="props.count"
					class="w-20"
					@update:value="(v: number | null) => emit('update:count', v ?? props.count)"
				/>
			</div>
		</div>

		<div class="flex flex-wrap gap-4 mt-3">
			<n-checkbox :checked="props.upper" @update:checked="(v: boolean) => emit('update:upper', v)"> A-Z </n-checkbox>
			<n-checkbox :checked="props.lower" @update:checked="(v: boolean) => emit('update:lower', v)"> a-z </n-checkbox>
			<n-checkbox :checked="props.numbers" @update:checked="(v: boolean) => emit('update:numbers', v)">
				0-9
			</n-checkbox>
			<n-checkbox :checked="props.symbols" @update:checked="(v: boolean) => emit('update:symbols', v)">
				!@#$
			</n-checkbox>
		</div>
	</div>
</template>
