<script lang="ts" setup>
	defineProps<{
		/** 指标名称 */
		label: string;
		/** 指标值（点击可复制） */
		value: string;
		/** 是否使用等宽字体（容量、数量等数字文案） */
		mono?: boolean;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<!-- 指标行：左侧名称、右侧数值，点击数值即复制 -->
	<div class="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
		<span class="shrink-0 text-xs font-medium text-slate-400">{{ label }}</span>
		<span
			:class="mono ? 'font-mono' : ''"
			:title="`点击复制：${value}`"
			class="cursor-pointer truncate text-right text-sm font-semibold text-slate-700 hover:text-blue-600"
			@click="emit('copy', value)"
		>
			{{ value }}
		</span>
	</div>
</template>
