<script lang="ts" setup>
	import { NInput, NSelect, type SelectOption } from 'naive-ui';

	const props = defineProps<{
		pattern: string;
		flags: string;
	}>();

	const emit = defineEmits<{
		'update:pattern': [value: string];
		'update:flags': [value: string];
	}>();

	const flagOptions: SelectOption[] = [
		{ value: 'g', label: 'g (全局)' },
		{ value: 'i', label: 'i (忽略大小写)' },
		{ value: 'm', label: 'm (多行)' },
		{ value: 's', label: 's (点匹配换行)' },
		{ value: 'gi', label: 'gi' },
		{ value: 'gm', label: 'gm' },
		{ value: 'gim', label: 'gim' },
		{ value: 'gis', label: 'gis' }
	];
</script>

<template>
	<div>
		<label class="block text-xs font-semibold text-slate-500 mb-2">正则表达式</label>
		<div class="flex gap-2">
			<n-input
				:value="props.pattern"
				class="flex-1 !font-mono"
				placeholder="输入正则表达式"
				@update:value="(v: string) => emit('update:pattern', v)"
			>
				<template #prefix>
					<span class="text-slate-400 font-mono">/</span>
				</template>
				<template #suffix>
					<span class="text-slate-400 font-mono">/</span>
				</template>
			</n-input>
			<n-select
				:options="flagOptions"
				:value="props.flags"
				class="!w-[140px] !max-w-full"
				@update:value="(v: string) => emit('update:flags', v)"
			/>
		</div>
	</div>
</template>
