<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { ToolGroup } from '@/types/tools';

	defineProps<{
		group: ToolGroup;
		collapsed: boolean;
	}>();

	const emit = defineEmits<{
		toggle: [id: string];
	}>();
</script>

<template>
	<!-- 分组标题行：点击折叠 / 展开该分组 -->
	<div class="group mb-4 flex cursor-pointer select-none items-center gap-2.5" @click="emit('toggle', group.id)">
		<span
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 ring-1 ring-inset ring-blue-100 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600"
		>
			<TkuIcon :name="group.icon" :size="16" />
		</span>
		<span class="text-sm font-bold tracking-wide text-slate-700 transition-colors group-hover:text-blue-600">
			{{ group.name }}
		</span>
		<span
			class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/80"
		>
			{{ group.tools.length }}
		</span>
		<span class="ml-1 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></span>
		<span
			:class="{ 'rotate-90': !collapsed }"
			class="shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-blue-500"
		>
			<TkuIcon :name="icons.chevronRight" :size="16" />
		</span>
	</div>
</template>
