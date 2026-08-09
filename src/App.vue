<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {type MenuOption, NLayout, NLayoutContent, NLayoutSider, NMenu} from 'naive-ui'
import {loadConfig, siteConfig} from './data/siteConfig'
import {toolGroups} from './data/tools'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

onMounted(() => loadConfig())

const menuOptions = computed<MenuOption[]>(() => [
  {label: '首页', key: 'home'},
  ...toolGroups.map((g) => ({
    label: g.icon + ' ' + g.name,
    key: g.id,
    type: 'group' as const,
    children: g.tools.map((t) => ({
      label: t.name,
      key: '/tool/' + t.id,
    })),
  })),
  {label: '设置', key: 'settings'},
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
    <!-- Sidebar -->
    <n-layout-sider
        v-model:collapsed="collapsed"
        :collapsed-width="64"
        :native-scrollbar="false"
        :width="200"
        bordered
        class="bg-white"
        collapse-mode="width"
        show-trigger="bar"
    >
      <div class="h-full flex flex-col">
        <div class="h-14 flex items-center px-4 border-b border-gray-100">
          <router-link class="no-underline" to="/">
            <span class="text-lg font-bold text-gray-800">{{ collapsed ? 'T' : 'TKU' }}</span>
          </router-link>
        </div>
        <div class="flex-1 overflow-auto py-2">
          <n-menu
              :collapsed="collapsed"
              :collapsed-width="64"
              :indent="18"
              :options="menuOptions"
              :value="activeKey"
              @update:value="handleMenuUpdate"
          />
        </div>
        <div
            v-if="!collapsed"
            class="px-4 py-2 border-t border-gray-100 text-[11px] text-gray-400 leading-tight space-y-0.5"
        >
          <p>{{ siteConfig.footer.copyright }}</p>
          <p v-if="siteConfig.footer.icp">{{ siteConfig.footer.icp }}</p>
        </div>
      </div>
    </n-layout-sider>

    <!-- Right: content + footer -->
    <div class="flex-1 flex flex-col min-w-0">
      <n-layout-content class="flex-1 p-4">
        <router-view/>
      </n-layout-content>
      <footer class="text-center text-[11px] text-gray-400 py-2 border-t border-gray-100 bg-white">
        <span v-if="siteConfig.footer.poweredBy">{{ siteConfig.footer.poweredBy }}</span>
      </footer>
    </div>
  </n-layout>
</template>
