<script lang="ts" setup>
	import { computed } from 'vue';
	import { useRoute } from 'vue-router';
	import { getToolById } from '@/data/tools';
	import BreadcrumbBar from '@/fragment/page/tool-page/BreadcrumbBar.vue';
	import ToolHeader from '@/fragment/page/tool-page/ToolHeader.vue';
	import ToolOutlet from '@/fragment/page/tool-page/ToolOutlet.vue';
	import NotFoundState from '@/fragment/page/tool-page/NotFoundState.vue';

	const route = useRoute();
	const toolId = computed(() => route.path.split('/').pop() || '');
	const tool = computed(() => getToolById(toolId.value));
</script>

<template>
	<div v-if="tool" class="flex flex-col min-h-full">
		<!-- 根容器占满滚动容器高度，内容不足时无页底空白；超出时自然增高滚动 -->

		<!-- BreadcrumbBar：返回首页面包屑 -->
		<BreadcrumbBar />

		<!-- ToolHeader：工具标题（渐变图标 + 名称 + 描述） -->
		<ToolHeader :tool="tool" />

		<!-- 工具内容容器 -->
		<div
			class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col flex-1 min-h-0"
		>
			<!-- ToolOutlet：嵌套路由渲染的工具页面出口（带过渡与缓存） -->
			<ToolOutlet />
		</div>
	</div>

	<!-- NotFoundState：工具未找到状态 -->
	<NotFoundState v-else />
</template>
