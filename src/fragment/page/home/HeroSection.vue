<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import QuickLinks from './QuickLinks.vue';
	import SearchInput from './SearchInput.vue';
	import StatsBadges from './StatsBadges.vue';
	import type { QuickLink } from '@/types/site';

	const props = defineProps<{
		appVersion: string;
		toolCount: number;
		groupCount: number;
		quickLinks: QuickLink[];
		query: string;
	}>();

	const emit = defineEmits<{
		'update:query': [value: string];
	}>();
</script>

<template>
	<!-- 英雄区（顶部横幅）：快捷链接 / 搜索 / 统计 -->
	<div class="mb-8 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-6 py-12 shadow-sm">
		<!-- 装饰性渐变光斑 -->
		<div class="pointer-events-none absolute inset-0">
			<div class="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"></div>
			<div class="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
		</div>

		<!-- QuickLinks：右上角快捷链接（站点配置） -->
		<QuickLinks :quick-links="quickLinks" />

		<div class="relative flex flex-col items-center text-center">
			<!-- 图标徽标 -->
			<div class="relative mb-5">
				<div class="absolute inset-0 -m-3 rounded-3xl bg-blue-400/25 blur-2xl"></div>
				<div
					class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/60"
				>
					<TkuIcon :name="icons.tools" :size="40" />
				</div>
			</div>

			<!-- 眉题与版本行 -->
			<div class="mb-4 flex items-center justify-center gap-2">
				<!-- 眉题徽标 -->
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
				>
					<TkuIcon :name="icons.lightning" :size="14" />
					开发者工具箱
				</span>
				<!-- 版本徽标：CI 构建时经 Git Tag 注入，本地开发为 dev-build -->
				<span
					class="inline-flex items-center rounded-full border border-green-200/70 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600"
					title="当前版本"
				>
					{{ props.appVersion }}
				</span>
			</div>

			<!-- 标题 -->
			<h1
				class="mb-3 bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-3xl sm:text-4xl font-bold tracking-tight text-transparent"
			>
				T Knit Utensil
			</h1>

			<!-- 描述 -->
			<p class="max-w-md leading-relaxed text-slate-500">
				面向开发者的在线工具集，{{ props.toolCount }} 个实用工具，覆盖编解码、格式化、生成、转换等常用场景
			</p>

			<!-- SearchInput：工具搜索框 -->
			<SearchInput
				:model-value="props.query"
				:tool-count="props.toolCount"
				@update:model-value="(v: string) => emit('update:query', v)"
			/>

			<!-- StatsBadges：工具 / 分类数量统计徽标 -->
			<StatsBadges :group-count="props.groupCount" :tool-count="props.toolCount" />
		</div>
	</div>
</template>
