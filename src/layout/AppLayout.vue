<script lang="ts" setup>
	import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { type MenuOption, NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui';
	import { siteConfig } from '@/composable/siteConfig';
	import { toolGroups } from '@/data/tools';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import logoImg from '@/assets/TKU.png';
	import logoIconImg from '@/assets/TKU-U.png';

	const router = useRouter();
	const route = useRoute();
	// 初始即按当前路由展开所属分组（等效 default-expanded-keys，刷新后立即可用）
	const expandedKeys = ref<string[]>([]);
	const collapsed = ref(false);
	let mediaQuery: MediaQueryList | null = null;

	function syncCollapsed() {
		if (mediaQuery) collapsed.value = mediaQuery.matches;
	}

	onMounted(() => {
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

	// 根据路由路径找到当前工具所属分组 id（菜单子项 key 为 /tool/<id>，分组 key 为分组 id）
	function findGroupId(path: string): string | undefined {
		if (!path.startsWith('/tool/')) return undefined;
		const toolId = path.slice('/tool/'.length);
		return toolGroups.find((g) => g.tools.some((t) => t.id === toolId))?.id;
	}

	// 把当前路由所属分组加入展开列表（无副作用：已展开则跳过）
	function expandForPath(path: string) {
		const groupId = findGroupId(path);
		if (groupId && !expandedKeys.value.includes(groupId)) {
			expandedKeys.value = [...expandedKeys.value, groupId];
		}
	}

	// 把滚动容器增量滚动到选中项（居中），动画期间用 rAF 自校准直到可见
	function scrollToActive() {
		nextTick().then(() => {
			// 子菜单展开动画约 300ms，延迟到动画完成后开始定位
			setTimeout(() => {
				const menuArea = document.querySelector('.n-layout-sider div.overflow-y-auto') as HTMLElement | null;
				const sel = document.querySelector('.n-menu-item-content--selected') as HTMLElement | null;
				if (!menuArea || !sel) return;
				const tryScroll = () => {
					const ar = menuArea.getBoundingClientRect();
					const sr = sel.getBoundingClientRect();
					// 已在可视区内（留 4px 容差）则停止
					if (sr.top >= ar.top - 4 && sr.bottom <= ar.bottom + 4) return;
					menuArea.scrollTop += sr.top - ar.top - (menuArea.clientHeight - sr.height) / 2;
					requestAnimationFrame(tryScroll);
				};
				tryScroll();
			}, 300);
		});
	}

	// 初始展开当前分组 + 滚动定位（刷新场景）
	expandForPath(route.path);
	onMounted(scrollToActive);

	// 路由变化（SPA 内导航）时自动展开新分组并滚动定位
	watch(
		() => route.path,
		(path) => {
			expandForPath(path);
			scrollToActive();
		}
	);

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
		}))
	]);

	const activeKey = computed(() => {
		if (route.path === '/') return 'home';
		if (route.path.startsWith('/tool/')) return route.path;
		return 'home';
	});

	function handleMenuUpdate(key: string) {
		if (key === 'home') router.push('/');
		else if (key.startsWith('/tool/')) router.push(key);
	}
</script>

<template>
	<n-layout class="h-screen" has-sider>
		<!-- 侧边栏（渐变背景） -->
		<n-layout-sider
			:collapsed="collapsed"
			:collapsed-width="64"
			:width="220"
			bordered
			class="sidebar"
			collapse-mode="width"
			content-style="display:flex;flex-direction:column;height:100%;overflow:hidden"
			show-trigger
			style="background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-right: 1px solid #e2e8f0"
			@update:collapsed="(value: boolean) => (collapsed = value)"
		>
			<div
				:class="collapsed ? 'px-2' : 'px-5'"
				class="h-18 flex items-center justify-center border-b border-slate-200/80 shrink-0"
			>
				<router-link class="no-underline flex flex-col items-center gap-1" to="/">
					<img :src="collapsed ? logoIconImg : logoImg" alt="TKU" class="h-8 drop-shadow-sm" />
					<span v-if="!collapsed" class="font-bold text-[18px] text-slate-600 tracking-tight leading-tight"
						>T Knit Utensil</span
					>
				</router-link>
			</div>
			<!-- 菜单区：flex-1 + overflow-y-auto，支持滚动并配合选中项自动定位 -->
			<div :class="collapsed ? 'px-1' : 'px-3'" class="flex-1 min-h-0 overflow-y-auto py-3">
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

		<!-- 内容区（淡渐变背景） -->
		<div class="flex-1 flex flex-col min-w-0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)">
			<n-layout-content class="flex-1 px-4 sm:px-6 py-2">
				<router-view v-slot="{ Component }">
					<transition mode="out-in" name="page">
						<component :is="Component" />
					</transition>
				</router-view>
			</n-layout-content>

			<!-- 页脚（毛玻璃效果） -->
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
</template>
