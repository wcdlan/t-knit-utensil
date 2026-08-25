<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { toolGroups } from '@/data/tools';
	import { siteConfig } from '@/composable/siteConfig';
	import HeroSection from '@/fragment/page/home/HeroSection.vue';
	import EmptyState from '@/fragment/page/home/EmptyState.vue';
	import SystemAdminCard from '@/fragment/page/home/SystemAdminCard.vue';
	import GroupSection from '@/fragment/page/home/GroupSection.vue';

	const query = ref('');
	const collapsed = ref<Record<string, boolean>>({});

	// CI 构建时由 Git Tag 注入（VITE_APP_VERSION），本地开发回退 dev-build
	const appVersion = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? 'dev-build';

	const toolCount = computed(() => toolGroups.reduce((sum, g) => sum + g.tools.length, 0));

	const filteredGroups = computed(() => {
		if (!query.value.trim()) return toolGroups;
		const q = query.value.toLowerCase();
		return toolGroups
			.map((g) => ({
				...g,
				tools: g.tools.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
			}))
			.filter((g) => g.tools.length > 0);
	});

	function toggle(id: string) {
		collapsed.value[id] = !collapsed.value[id];
	}
</script>

<template>
	<div>
		<!-- HeroSection：首页顶部横幅（快捷链接 / 搜索 / 统计） -->
		<HeroSection
			:app-version="appVersion"
			:group-count="toolGroups.length"
			:query="query"
			:quick-links="siteConfig.quickLinks"
			:tool-count="toolCount"
			@update:query="(v: string) => (query = v)"
		/>

		<!-- EmptyState：搜索无结果时的空状态提示 -->
		<EmptyState v-if="filteredGroups.length === 0" />

		<!-- SystemAdminCard：系统管理入口（固定展示，不参与搜索与折叠） -->
		<SystemAdminCard />

		<!-- GroupSection：工具分组区块（标题折叠 + 工具卡片网格） -->
		<GroupSection
			v-for="group in filteredGroups"
			:key="group.id"
			:collapsed="!!collapsed[group.id]"
			:group="group"
			@toggle="toggle"
		/>
	</div>
</template>
