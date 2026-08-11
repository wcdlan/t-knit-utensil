<script lang="ts" setup>
	import { computed, onMounted, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { type MenuOption, NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui'
	import { loadConfig, siteConfig } from './data/siteConfig'
	import { toolGroups } from './data/tools'
	import logoImg from './assets/TKU.png'

	const router = useRouter()
	const route = useRoute()
	const expandedKeys = ref<string[]>([])

	onMounted(() => loadConfig())

	const menuOptions = computed<MenuOption[]>(() => [
		{ label: '🏠 首页', key: 'home' },
		...toolGroups.map((g) => ({
			label: g.icon + ' ' + g.name,
			key: g.id,
			children: g.tools.map((t) => ({
				label: t.name,
				key: '/tool/' + t.id
			}))
		})),
		{ label: '⚙️ 设置', key: 'settings' }
	])

	const activeKey = computed(() => {
		if (route.path === '/') return 'home'
		if (route.path === '/settings') return 'settings'
		if (route.path.startsWith('/tool/')) return '/tool/' + route.params.toolId
		return 'home'
	})

	function handleMenuUpdate(key: string) {
		if (key === 'home') router.push('/')
		else if (key === 'settings') router.push('/settings')
		else if (key.startsWith('/tool/')) router.push(key)
	}
</script>

<template>
	<n-layout class="h-screen" has-sider>
		<n-layout-sider :width="220" bordered class="bg-white border-gray-200">
			<div class="h-14 flex items-center justify-center px-4 border-b border-gray-200">
				<router-link class="no-underline flex items-center gap-2" to="/">
					<img :src="logoImg" alt="TKU" class="h-8" />
				</router-link>
			</div>
			<n-menu
				:expanded-keys="expandedKeys"
				:indent="20"
				:options="menuOptions"
				:value="activeKey"
				@update:value="handleMenuUpdate"
				@update:expanded-keys="(keys: string[]) => (expandedKeys = keys)"
			/>
		</n-layout-sider>

		<div class="flex-1 flex flex-col min-w-0 bg-gray-50">
			<n-layout-content class="flex-1 p-4">
				<router-view />
			</n-layout-content>
			<footer class="text-center text-xs text-gray-500 py-2.5 border-t border-gray-200 bg-white">
				<span>&copy; {{ new Date().getFullYear() }} {{ siteConfig.footer.copyright || 'TKU' }}</span>
				<span v-if="siteConfig.footer.icp" class="ml-4">
					<a
						:href="siteConfig.footer.icpUrl || 'https://beian.miit.gov.cn'"
						class="hover:text-gray-700 transition"
						target="_blank"
					>
						{{ siteConfig.footer.icp }}
					</a>
				</span>
				<span v-if="siteConfig.footer.poweredBy" class="ml-4 text-gray-400">{{ siteConfig.footer.poweredBy }}</span>
			</footer>
		</div>
	</n-layout>
</template>
