<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NEmpty, NInput, NTooltip } from 'naive-ui';
	import { toolGroups } from '@/data/tools';
	import { icons } from '@/data/icons';
	import { siteConfig } from '@/data/siteConfig';
	import TkuIcon from '@/components/common/TkuIcon.vue';

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
		<!-- Hero section -->
		<div class="mb-8 relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-6 py-12 shadow-sm">
			<!-- Decorative gradient orbs -->
			<div class="pointer-events-none absolute inset-0">
				<div class="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"></div>
				<div class="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
			</div>

			<!-- Quick links -->
			<div v-if="siteConfig.quickLinks.length" class="absolute right-4 top-4 z-10 flex items-center gap-1.5">
				<n-tooltip v-for="link in siteConfig.quickLinks" :key="link.url">
					<template #trigger>
						<a
							:href="link.url"
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-500"
							:rel="link.newTab ? 'noopener noreferrer' : undefined"
							:target="link.newTab ? '_blank' : '_self'"
						>
							<TkuIcon :name="link.icon" :size="18" />
						</a>
					</template>
					{{ link.name || link.url }}
				</n-tooltip>
			</div>

			<div class="relative flex flex-col items-center text-center">
				<!-- Icon badge -->
				<div class="relative mb-5">
					<div class="absolute inset-0 -m-3 rounded-3xl bg-blue-400/25 blur-2xl"></div>
					<div
						class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/60"
					>
						<TkuIcon :name="icons.tools" :size="40" />
					</div>
				</div>

				<!-- Eyebrow + version row -->
				<div class="mb-4 flex items-center justify-center gap-2">
					<!-- Eyebrow badge -->
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
					>
						<TkuIcon :name="icons.lightning" :size="14" />
						开发者工具箱
					</span>
					<!-- Version badge: injected by CI build via git tag, dev-build in local dev -->
					<span
						class="inline-flex items-center rounded-full border border-green-200/70 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600"
						title="当前版本"
					>
						{{ appVersion }}
					</span>
				</div>

				<!-- Title -->
				<h1
					class="mb-3 bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-3xl sm:text-4xl font-bold tracking-tight text-transparent"
				>
					T Knit Utensil
				</h1>

				<!-- Description -->
				<p class="max-w-md leading-relaxed text-slate-500">
					面向开发者的在线工具集，{{ toolCount }} 个实用工具，覆盖编解码、格式化、生成、转换等常用场景
				</p>

				<!-- Search -->
				<div class="mt-6 w-full max-w-lg">
					<n-input
						v-model:value="query"
						:placeholder="`搜索 ${toolCount} 个工具...`"
						class="search-input"
						clearable
						size="large"
					/>
				</div>

				<!-- Stats -->
				<div class="mt-7 flex flex-wrap items-center justify-center gap-3">
					<div
						class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur"
					>
						<span class="text-lg font-bold text-slate-800">{{ toolCount }}</span>
						<span class="text-xs text-slate-500">个工具</span>
					</div>
					<div
						class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur"
					>
						<span class="text-lg font-bold text-slate-800">{{ toolGroups.length }}</span>
						<span class="text-xs text-slate-500">个分类</span>
					</div>
				</div>
			</div>
		</div>

		<n-empty v-if="filteredGroups.length === 0" class="py-16" description="未找到匹配的工具" />

		<!-- 系统管理组（入口固定在第一组，不参与搜索与折叠） -->
		<div class="mb-6">
			<div class="mb-4 flex items-center gap-2.5">
				<span
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 ring-1 ring-inset ring-blue-100"
				>
					<TkuIcon :name="icons.cog" :size="16" />
				</span>
				<span class="text-sm font-bold tracking-wide text-slate-700">系统管理</span>
				<span
					class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/80"
				>
					1
				</span>
				<span class="ml-1 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></span>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
				<router-link
					class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/card"
					title="配置站点信息、页脚内容与登录密码"
					to="/admin/config"
				>
					<span class="text-slate-500 transition-transform duration-200 group-hover/card:scale-110">
						<TkuIcon :name="icons.cog" :size="24" />
					</span>
					<span class="text-sm font-medium text-slate-700 text-center leading-tight">系统配置</span>
				</router-link>
			</div>
		</div>

		<div v-for="group in filteredGroups" :key="group.id" class="mb-6">
			<!-- Group header -->
			<div class="group mb-4 flex cursor-pointer select-none items-center gap-2.5" @click="toggle(group.id)">
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
					:class="{ 'rotate-90': !collapsed[group.id] }"
					class="shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-blue-500"
				>
					<TkuIcon :name="icons.chevronRight" :size="16" />
				</span>
			</div>

			<!-- Tool cards grid -->
			<div
				v-show="!collapsed[group.id]"
				class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
			>
				<router-link
					v-for="tool in group.tools"
					:key="tool.id"
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
			</div>
		</div>
	</div>
</template>
