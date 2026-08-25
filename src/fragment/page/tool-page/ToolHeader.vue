<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { Tool } from '@/types/tools';

	defineProps<{
		tool: Tool;
	}>();
</script>

<template>
	<!-- 工具标题：渐变图标容器 + 名称 + 描述 -->
	<div class="mb-8 flex-shrink-0">
		<div class="flex items-center gap-4">
			<div
				class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-sm"
			>
				<TkuIcon :name="tool.icon" :size="28" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-slate-800 tracking-tight">{{ tool.name }}</h1>
				<p class="text-slate-500 text-sm mt-0.5">{{ tool.description }}</p>
			</div>
		</div>
	</div>
</template>
