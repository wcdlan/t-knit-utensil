<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { KeyboardLayout, KeyboardLayoutOption } from '@/types/keyboard';

	const props = defineProps<{
		layout: KeyboardLayout;
		options: KeyboardLayoutOption[];
		/** 是否为当前系统环境推断出的默认布局 */
		isDefaultLayout: boolean;
	}>();

	const emit = defineEmits<{
		'update:layout': [value: KeyboardLayout];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">键盘布局</span>
		<n-button-group>
			<n-button
				v-for="option in props.options"
				:key="option.value"
				:title="option.description"
				:type="props.layout === option.value ? 'primary' : 'default'"
				@click="emit('update:layout', option.value)"
			>
				{{ option.label }}
			</n-button>
		</n-button-group>
		<!-- 默认布局提示：按当前系统环境自动选中 -->
		<span
			v-if="props.isDefaultLayout"
			class="inline-flex items-center gap-1 rounded-full border border-green-200/70 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-600"
		>
			<TkuIcon :name="icons.check" :size="12" />
			已按当前系统环境自动选中
		</span>
	</div>
</template>
