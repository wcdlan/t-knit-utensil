<script lang="ts" setup>
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		secValue: string;
		secResult: string;
		msValue: string;
		msResult: string;
	}>();

	const emit = defineEmits<{
		'update:secValue': [value: string];
		'update:msValue': [value: string];
		copySec: [];
		copyMs: [];
	}>();
</script>

<template>
	<div>
		<h3 class="text-sm font-semibold text-slate-700 mb-2">时间戳 → 日期</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-2">秒级时间戳 (10 位)</label>
				<n-input
					:value="props.secValue"
					class="!font-mono"
					placeholder="输入秒级时间戳"
					@update:value="(v: string) => emit('update:secValue', v)"
				/>
				<div
					:class="props.secResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
					class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono transition hover:bg-blue-50/60"
					@click="emit('copySec')"
				>
					{{ props.secResult || '输入时间戳后将显示转换结果' }}
				</div>
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-2">毫秒级时间戳 (13 位)</label>
				<n-input
					:value="props.msValue"
					class="!font-mono"
					placeholder="输入毫秒级时间戳"
					@update:value="(v: string) => emit('update:msValue', v)"
				/>
				<div
					:class="props.msResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
					class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono transition hover:bg-blue-50/60"
					@click="emit('copyMs')"
				>
					{{ props.msResult || '输入时间戳后将显示转换结果' }}
				</div>
			</div>
		</div>
	</div>
</template>
