<script lang="ts" setup>
	import { computed, h, onMounted, ref } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { type MenuOption, NConfigProvider, NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui';
	import { themeOverrides } from './assets/theme';
	import { loadConfig, siteConfig } from './data/siteConfig';
	import { toolGroups } from './data/tools';
	import { icons } from './data/icons';
	import TkuIcon from './components/common/TkuIcon.vue';
	import logoImg from './assets/TKU.png';

	const router = useRouter();
	const route = useRoute();
	const expandedKeys = ref<string[]>([]);

	onMounted(() => loadConfig());

	function renderMenuLabel(icon: string, text: string) {
		return () =>
			h('span', { class: 'flex items-center gap-2' }, [h(TkuIcon, { name: icon, size: 18 }), h('span', text)]);
	}

	const menuOptions = computed<MenuOption[]>(() => [
		{ label: renderMenuLabel(icons.home, '首页'), key: 'home' },
		...toolGroups.map((g) => ({
			label: renderMenuLabel(g.icon, g.name),
			key: g.id,
			children: g.tools.map((t) => ({
				label: t.name,
				key: '/tool/' + t.id
			}))
		})),
		{ label: renderMenuLabel(icons.cog, '设置'), key: 'settings' }
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
				bordered
				class="sidebar"
				style="background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-right: 1px solid #e2e8f0"
			>
				<div class="h-18 flex items-center justify-center px-5 border-b border-slate-200/80">
					<router-link class="no-underline flex flex-col items-center gap-1" to="/">
						<img :src="logoImg" alt="TKU" class="h-8 drop-shadow-sm" />
						<span class="font-bold text-[18px] text-slate-600 tracking-tight leading-tight">T Knit Utensil</span>
					</router-link>
				</div>
				<div class="px-3 py-3">
					<n-menu
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
