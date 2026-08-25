<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { Tool } from '@/types/tools';

	defineProps<{
		tool: Tool;
	}>();
</script>

<template>
	<!-- 工具卡片：跳转到对应工具页面 -->
	<router-link
		:title="tool.description"
		:to="`/tool/${tool.id}`"
		class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/card"
	>
		<span class="text-slate-500 transition-transform duration-200 group-hover/card:scale-110">
			<TkuIcon :name="tool.icon" :size="24" />
		</span>
		<span class="text-sm font-medium text-slate-700 text-center leading-tight">
			{{ tool.name }}
		</span>
	</router-link>
</template>
