<script lang="ts" setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {isDev, saveConfig, siteConfig} from '../data/siteConfig'
import {useAuth} from '../data/auth'

const router = useRouter()
const {logout} = useAuth()

const saved = ref(false)
const error = ref('')

async function handleSave() {
  error.value = ''
  saved.value = false
  const ok = await saveConfig()
  if (ok) {
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } else {
    error.value = '保存失败，请确认在开发模式下运行'
  }
}

function handleLogout() {
  logout()
  router.replace('/')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <router-link class="text-sm text-blue-500 hover:text-blue-700 transition" to="/">
        &larr; 返回首页
      </router-link>
      <button
          class="text-sm text-gray-400 hover:text-red-500 transition cursor-pointer"
          @click="handleLogout"
      >退出登录
      </button>
    </div>

    <h1 class="text-2xl font-bold text-gray-900 mb-2">站点设置</h1>
    <p class="text-gray-500 text-sm mb-8">配置站点名称、备案信息等内容，保存到项目配置文件</p>

    <div v-if="!isDev" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 mb-6">
      当前为生产模式，无法修改配置。请在开发模式下运行 <code class="bg-yellow-100 px-1 rounded">pnpm dev</code> 进行配置。
    </div>

    <div class="space-y-6">
      <!-- Site Info -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <fieldset>
          <legend class="text-sm font-semibold text-gray-700 mb-3">站点信息</legend>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">站点名称</label>
              <input
                  v-model="siteConfig.siteName"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">站点描述</label>
              <input
                  v-model="siteConfig.siteDescription"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <!-- Footer -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <fieldset>
          <legend class="text-sm font-semibold text-gray-700 mb-3">页脚设置</legend>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">版权归属</label>
              <input
                  v-model="siteConfig.footer.copyright"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">ICP 备案号</label>
              <input
                  v-model="siteConfig.footer.icp"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="例: 京ICP备XXXXXXXX号"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">备案链接</label>
              <input
                  v-model="siteConfig.footer.icpUrl"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">底部声明文字</label>
              <input
                  v-model="siteConfig.footer.poweredBy"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <!-- Auth -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <fieldset>
          <legend class="text-sm font-semibold text-gray-700 mb-3">安全设置</legend>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">新密码（修改登录密码）</label>
              <input
                  v-model="siteConfig.auth.password"
                  class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="输入新密码"
                  type="password"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <!-- Save -->
      <div class="flex items-center gap-3">
        <button
            v-if="isDev"
            class="px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
            @click="handleSave"
        >保存配置
        </button>
        <span v-if="saved" class="text-sm text-green-600">配置已保存</span>
        <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
      </div>
    </div>

    <div class="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed">
      运行时数据文件：<code class="bg-gray-100 px-1 rounded">site.db.json</code>（node-json-db 管理）。
      默认配置文件：<code class="bg-gray-100 px-1 rounded">site.config.json</code>（仅作初始默认值）。
    </div>
  </div>
</template>
