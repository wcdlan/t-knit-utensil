<script lang="ts" setup>
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { NAlert, NButton, NCard, NInput } from 'naive-ui'
	import { useAuth } from '@/data/auth'

	const router = useRouter()
	const { login } = useAuth()
	const password = ref('')
	const error = ref('')
	const loading = ref(false)

	async function handleLogin() {
		if (!password.value) return
		error.value = ''
		loading.value = true
		const ok = await login(password.value)
		loading.value = false
		if (ok) {
			router.replace('/settings')
		} else {
			error.value = '密码错误'
			password.value = ''
		}
	}
</script>

<template>
	<div class="max-w-sm mx-auto mt-20">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold text-gray-900 mb-2">设置登录</h1>
			<p class="text-sm text-gray-500">请输入密码以访问站点设置</p>
		</div>

		<n-card>
			<div class="space-y-4">
				<div>
					<label class="block text-xs font-semibold text-gray-500 mb-1">密码</label>
					<n-input
						v-model:value="password"
						placeholder="请输入密码"
						show-password-toggle
						size="large"
						type="password"
						@keyup.enter="handleLogin"
					/>
				</div>

				<n-alert v-if="error" class="text-sm" type="error">
					{{ error }}
				</n-alert>

				<n-button :loading="loading" block size="large" type="primary" @click="handleLogin">
					{{ loading ? '验证中...' : '登录' }}
				</n-button>
			</div>
		</n-card>

		<div class="mt-4 text-center">
			<router-link class="text-sm text-gray-400 hover:text-gray-600 transition" to="/"> 返回首页 </router-link>
		</div>
	</div>
</template>
