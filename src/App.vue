<script lang="ts" setup>
import {onMounted} from 'vue'
import {loadConfig, siteConfig} from './data/siteConfig'

onMounted(() => loadConfig())
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link class="flex items-center gap-2 hover:opacity-80 transition" to="/">
          <span class="text-xl font-bold text-gray-800">{{ siteConfig.siteName }}</span>
        </router-link>
        <div class="flex items-center gap-4">
          <router-link class="text-sm text-gray-500 hover:text-gray-700 transition" to="/settings">
            设置
          </router-link>
          <a
              class="text-sm text-gray-500 hover:text-gray-700 transition"
              href="https://github.com"
              target="_blank"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-6 flex-1 w-full">
      <router-view/>
    </main>
    <footer class="border-t border-gray-200 bg-white mt-12">
      <div class="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400 space-y-1">
        <p>&copy; {{ new Date().getFullYear() }} {{ siteConfig.footer.copyright || siteConfig.siteName }}</p>
        <p v-if="siteConfig.footer.icp">
          <a
              :href="siteConfig.footer.icpUrl || 'https://beian.miit.gov.cn'"
              class="hover:text-gray-600 transition"
              target="_blank"
          >
            {{ siteConfig.footer.icp }}
          </a>
        </p>
        <p v-if="siteConfig.footer.poweredBy">{{ siteConfig.footer.poweredBy }}</p>
      </div>
    </footer>
  </div>
</template>
