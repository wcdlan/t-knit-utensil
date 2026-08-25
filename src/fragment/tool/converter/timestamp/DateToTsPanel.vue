<script lang="ts" setup>
	import { NDatePicker } from 'naive-ui';

	const props = defineProps<{
		dateValue: number | null;
		dateResult: string;
	}>();

	const emit = defineEmits<{
		'update:dateValue': [value: number | null];
		copy: [];
	}>();
</script>

<template>
	<div>
		<h3 class="text-sm font-semibold text-slate-700 mb-2">日期 → 时间戳</h3>
		<div class="flex gap-2">
			<n-date-picker
				:value="props.dateValue"
				class="flex-1"
				type="datetime"
				@update:value="(v: number | null) => emit('update:dateValue', v)"
			/>
		</div>
		<div
			:class="props.dateResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
			class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono whitespace-pre transition hover:bg-blue-50/60"
			@click="emit('copy')"
		>
			{{ props.dateResult || '选择日期后将显示时间戳转换结果' }}
		</div>
	</div>
</template>
