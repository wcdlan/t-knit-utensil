<script lang="ts" setup>
	import GroupHeader from './GroupHeader.vue';
	import ToolCard from './ToolCard.vue';
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
	<!-- 分组区块：分组标题 + 工具卡片网格 -->
	<div class="mb-6">
		<!-- GroupHeader：分组标题行（点击折叠 / 展开） -->
		<GroupHeader :collapsed="collapsed" :group="group" @toggle="(id: string) => emit('toggle', id)" />

		<!-- 工具卡片网格 -->
		<div v-show="!collapsed" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
			<!-- ToolCard：单个工具入口卡片 -->
			<ToolCard v-for="tool in group.tools" :key="tool.id" :tool="tool" />
		</div>
	</div>
</template>
