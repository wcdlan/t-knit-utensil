<script lang="ts" setup>
	import { computed } from 'vue';
	import {
		CHMOD_PRESET_CATEGORIES,
		CHMOD_PRESET_CATEGORY_LABELS,
		CHMOD_PRESETS,
		formatOctal,
		parseOctal,
		toSymbolic
	} from '@/utils/chmod';

	const props = defineProps<{
		/** 当前权限值（用于高亮命中的预设） */
		mode: number;
	}>();

	const emit = defineEmits<{
		apply: [octal: string];
	}>();

	/** 预设分组（文件 / 目录 / 特殊位） */
	const groups = computed(() =>
		CHMOD_PRESET_CATEGORIES.map((category) => ({
			category,
			label: CHMOD_PRESET_CATEGORY_LABELS[category],
			items: CHMOD_PRESETS.filter((preset) => preset.category === category)
		}))
	);

	/** 预设的符号表示：由八进制推导，保证与结果区一致 */
	function symbolicOf(octal: string): string {
		const parsed = parseOctal(octal);
		return parsed.ok ? toSymbolic(parsed.mode) : '';
	}

	/** 预设是否为当前权限值 */
	function isActive(octal: string): boolean {
		const parsed = parseOctal(octal);
		return parsed.ok && formatOctal(parsed.mode) === formatOctal(props.mode);
	}
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-3.5">
		<div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-sm font-semibold text-slate-800">常用权限速查</h3>
			<span class="text-xs text-slate-400">点击卡片套用</span>
		</div>

		<div v-for="group in groups" :key="group.category" class="mb-2.5 last:mb-0">
			<div class="mb-1.5 flex items-center gap-2">
				<span class="shrink-0 text-xs font-semibold text-slate-500">{{ group.label }}</span>
				<span class="h-px flex-1 bg-slate-200" />
			</div>
			<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				<button
					v-for="preset in group.items"
					:key="preset.octal"
					:class="
						isActive(preset.octal)
							? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
							: 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
					"
					:title="`${preset.description}（${preset.usage}）`"
					class="rounded-lg border px-2.5 py-1.5 text-left transition"
					type="button"
					@click="emit('apply', preset.octal)"
				>
					<div class="flex flex-wrap items-baseline gap-x-2">
						<span class="font-mono text-sm font-semibold text-blue-700">{{ preset.octal }}</span>
						<span class="font-mono text-xs text-slate-500">{{ symbolicOf(preset.octal) }}</span>
					</div>
					<div class="mt-0.5 text-xs text-slate-600">{{ preset.description }}</div>
					<div class="mt-0.5 text-[11px] text-slate-400">{{ preset.usage }}</div>
				</button>
			</div>
		</div>
	</div>
</template>
