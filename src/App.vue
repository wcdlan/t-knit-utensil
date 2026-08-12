<script lang="ts" setup>
	import { computed, h, onBeforeUnmount, onMounted, ref } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { type MenuOption, NConfigProvider, NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui';
	import { themeOverrides } from './assets/theme';
	import { loadConfig, siteConfig } from './data/siteConfig';
	import { toolGroups } from './data/tools';
	import { icons } from './data/icons';
	import TkuIcon from './components/common/TkuIcon.vue';
	import logoImg from './assets/TKU.png';
	import logoIconImg from './assets/TKU-U.png';

	const router = useRouter();
	const route = useRoute();
	const expandedKeys = ref<string[]>([]);
	const collapsed = ref(false);
	let mediaQuery: MediaQueryList | null = null;

	function syncCollapsed() {
		if (mediaQuery) collapsed.value = mediaQuery.matches;
	}

	onMounted(() => {
		loadConfig();
		// 小屏（≤768px）自动收缩侧边栏
		mediaQuery = window.matchMedia('(max-width: 768px)');
		syncCollapsed();
		mediaQuery.addEventListener('change', syncCollapsed);
	});

	onBeforeUnmount(() => {
		mediaQuery?.removeEventListener('change', syncCollapsed);
	});

	function renderMenuIcon(icon: string) {
		return () => h(TkuIcon, { name: icon, size: 18 });
	}

	const menuOptions = computed<MenuOption[]>(() => [
		{ label: '首页', icon: renderMenuIcon(icons.home), key: 'home' },
		...toolGroups.map((g) => ({
			label: g.name,
			icon: renderMenuIcon(g.icon),
			key: g.id,
			children: g.tools.map((t) => ({
				label: t.name,
				key: '/tool/' + t.id
			}))
		})),
		{ label: '设置', icon: renderMenuIcon(icons.cog), key: 'settings' }
	]);

	const activeKey = computed(() => {
		if (route.path === '/') return 'home';
		if (route.path === '/settings') return 'settings';
		if (route.path.startsWith('/tool/')) return route.path;
		return 'home';
	});

	function handleMenuUpdate(key: string) {
		if (key === 'home') router.push('/');
		else if (key === 'settings') router.push('/settings');
		else if (key.startsWith('/tool/')) router.push(key);
	}
</script>

<template>
	<n-config-provider :theme-overrides="themeOverrides">
		<n-layout class="h-screen" has-sider>
			<!-- Sidebar with gradient background -->
			<n-layout-sider
				:width="220"
				:collapsed="collapsed"
				:collapsed-width="64"
				collapse-mode="width"
				show-trigger
				bordered
				class="sidebar"
				style="background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-right: 1px solid #e2e8f0"
				@update:collapsed="(value: boolean) => (collapsed = value)"
			>
				<div
					:class="collapsed ? 'px-2' : 'px-5'"
					class="h-18 flex items-center justify-center border-b border-slate-200/80"
				>
					<router-link class="no-underline flex flex-col items-center gap-1" to="/">
						<img :src="collapsed ? logoIconImg : logoImg" alt="TKU" class="h-8 drop-shadow-sm" />
						<span v-if="!collapsed" class="font-bold text-[18px] text-slate-600 tracking-tight leading-tight"
							>T Knit Utensil</span
						>
					</router-link>
				</div>
				<div :class="collapsed ? 'px-1' : 'px-3'" class="py-3">
					<n-menu
						:collapsed="collapsed"
						:collapsed-width="56"
						:expanded-keys="expandedKeys"
						:indent="20"
						:options="menuOptions"
						:value="activeKey"
						@update:value="handleMenuUpdate"
						@update:expanded-keys="(keys: string[]) => (expandedKeys = keys)"
					/>
				</div>
			</n-layout-sider>

			<!-- Content area with subtle gradient background -->
			<div class="flex-1 flex flex-col min-w-0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)">
				<n-layout-content class="flex-1 px-6 py-2">
					<router-view v-slot="{ Component }">
						<transition mode="out-in" name="page">
							<component :is="Component" />
						</transition>
					</router-view>
				</n-layout-content>

				<!-- Footer with glass effect -->
				<footer
					class="text-center text-xs py-3 border-t border-slate-200/80"
					style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(8px)"
				>
					<span class="text-slate-400"
						>&copy; {{ new Date().getFullYear() }} {{ siteConfig.footer.copyright || 'TKU' }}</span
					>
					<span v-if="siteConfig.footer.icp" class="ml-4 text-slate-400">
						<a
							:href="siteConfig.footer.icpUrl || 'https://beian.miit.gov.cn'"
							class="hover:text-slate-600 transition-colors duration-200"
							target="_blank"
						>
							{{ siteConfig.footer.icp }}
						</a>
					</span>
					<span v-if="siteConfig.footer.poweredBy" class="ml-4 text-slate-300">{{ siteConfig.footer.poweredBy }}</span>
				</footer>
			</div>
		</n-layout>
	</n-config-provider>
</template>
