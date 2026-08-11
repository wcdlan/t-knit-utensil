<script lang="ts" setup>
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { NAlert, NButton, NCard, NInput } from 'naive-ui'
	import { isDev, saveConfig, siteConfig } from '@/data/siteConfig'
	import { useAuth } from '@/data/auth'

	const router = useRouter()
	const { logout } = useAuth()

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
			<router-link class="text-sm text-blue-500 hover:text-blue-700 transition" to="/"> &larr; 返回首页 </router-link>
			<button class="text-sm text-gray-400 hover:text-red-500 transition cursor-pointer" @click="handleLogout">
				退出登录
			</button>
		</div>

		<h1 class="text-2xl font-bold text-gray-900 mb-2">站点设置</h1>
		<p class="text-gray-500 text-sm mb-8">配置站点名称、备案信息等内容，保存到项目配置文件</p>

		<n-alert v-if="!isDev" class="mb-6 text-sm" type="warning">
			当前为生产模式，无法修改配置。请在开发模式下运行
			<code class="bg-yellow-100 px-1 rounded">pnpm dev</code> 进行配置。
		</n-alert>

		<div class="space-y-6">
			<!-- Site Info -->
			<n-card title="站点信息">
				<div class="space-y-3">
					<div>
						<label class="block text-xs text-gray-500 mb-1">站点名称</label>
						<n-input v-model:value="siteConfig.siteName" />
					</div>
					<div>
						<label class="block text-xs text-gray-500 mb-1">站点描述</label>
						<n-input v-model:value="siteConfig.siteDescription" />
					</div>
				</div>
			</n-card>

			<!-- Footer -->
			<n-card title="页脚设置">
				<div class="space-y-3">
					<div>
						<label class="block text-xs text-gray-500 mb-1">版权归属</label>
						<n-input v-model:value="siteConfig.footer.copyright" />
					</div>
					<div>
						<label class="block text-xs text-gray-500 mb-1">ICP 备案号</label>
						<n-input v-model:value="siteConfig.footer.icp" placeholder="例: 京ICP备XXXXXXXX号" />
					</div>
					<div>
						<label class="block text-xs text-gray-500 mb-1">备案链接</label>
						<n-input v-model:value="siteConfig.footer.icpUrl" />
					</div>
					<div>
						<label class="block text-xs text-gray-500 mb-1">底部声明文字</label>
						<n-input v-model:value="siteConfig.footer.poweredBy" />
					</div>
				</div>
			</n-card>

			<!-- Auth -->
			<n-card title="安全设置">
				<div class="space-y-3">
					<div>
						<label class="block text-xs text-gray-500 mb-1">新密码（修改登录密码）</label>
						<n-input
							v-model:value="siteConfig.auth.password"
							placeholder="输入新密码"
							show-password-toggle
							type="password"
						/>
					</div>
				</div>
			</n-card>

			<!-- Save -->
			<div class="flex items-center gap-3">
				<n-button v-if="isDev" type="primary" @click="handleSave"> 保存配置 </n-button>
				<n-alert v-if="saved" class="text-sm" type="success"> 配置已保存 </n-alert>
				<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>
			</div>
		</div>

		<div class="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed">
			运行时数据文件：<code class="bg-gray-100 px-1 rounded">site.db.json</code>（node-json-db 管理）。
			默认配置文件：<code class="bg-gray-100 px-1 rounded">site.config.json</code>（仅作初始默认值）。
		</div>
	</div>
</template>
