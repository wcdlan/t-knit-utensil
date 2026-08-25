<script lang="ts" setup>
	import { NButton, NInputNumber } from 'naive-ui';

	defineProps<{
		r: number | null;
		g: number | null;
		b: number | null;
		h: number;
		s: number;
		l: number;
	}>();

	const emit = defineEmits<{
		'update:r': [value: number | null];
		'update:g': [value: number | null];
		'update:b': [value: number | null];
		copy: [value: string];
	}>();
</script>

<template>
	<div class="space-y-4">
		<!-- RGB 分量 -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-2">RGB</label>
			<div class="flex flex-wrap items-center gap-2">
				<n-input-number
					:max="255"
					:min="0"
					:value="r"
					class="!w-[80px] !font-mono"
					size="small"
					@update:value="emit('update:r', $event)"
				/>
				<n-input-number
					:max="255"
					:min="0"
					:value="g"
					class="!w-[80px] !font-mono"
					size="small"
					@update:value="emit('update:g', $event)"
				/>
				<n-input-number
					:max="255"
					:min="0"
					:value="b"
					class="!w-[80px] !font-mono"
					size="small"
					@update:value="emit('update:b', $event)"
				/>
				<span
					class="text-xs text-slate-400 font-mono mx-1 cursor-pointer transition hover:text-blue-600"
					@click="emit('copy', `rgb(${r}, ${g}, ${b})`)"
					>rgb({{ r }}, {{ g }}, {{ b }})</span
				>
				<n-button secondary size="small" @click="emit('copy', `rgb(${r}, ${g}, ${b})`)">复制</n-button>
			</div>
		</div>

		<!-- HSL 分量 -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-2">HSL</label>
			<div class="flex flex-wrap items-center gap-2">
				<div
					class="px-3 py-1.5 bg-slate-50 rounded-lg text-sm font-mono text-slate-600 cursor-pointer transition hover:bg-blue-50/60"
					@click="emit('copy', `hsl(${h}, ${s}%, ${l}%)`)"
				>
					hsl({{ h }}, {{ s }}%, {{ l }}%)
				</div>
				<n-button secondary size="small" @click="emit('copy', `hsl(${h}, ${s}%, ${l}%)`)">复制</n-button>
			</div>
		</div>
	</div>
</template>
