<script lang="ts" setup>
	import { obfuscationPresets } from '@/data/jsObfuscatorOptions';
	import type { ObfuscationPresetKey } from '@/types/jsObfuscator';

	const props = defineProps<{
		presetKey: ObfuscationPresetKey;
	}>();

	const emit = defineEmits<{
		'update:presetKey': [value: ObfuscationPresetKey];
	}>();
</script>

<template>
	<!-- PresetSelect：混淆强度预设选择（低/中/高/默认，默认低混淆） -->
	<div
		class="px-3 py-2 bg-slate-50/70 rounded-lg border border-slate-200/80 flex flex-wrap items-center gap-2 flex-shrink-0"
	>
		<span class="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
			混淆预设
		</span>
		<div class="flex flex-wrap items-center gap-1.5">
			<button
				v-for="preset in obfuscationPresets"
				:key="preset.key"
				:class="
					props.presetKey === preset.key
						? 'border-blue-400 bg-blue-50 text-blue-700 ring-1 ring-blue-300'
						: 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
				"
				:title="preset.description"
				class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
				@click="emit('update:presetKey', preset.key)"
			>
				{{ preset.name }}
			</button>
		</div>
		<span class="text-[11px] text-slate-400 ml-auto hidden md:inline">切换预设自动应用对应选项，可在下方微调</span>
	</div>
</template>
