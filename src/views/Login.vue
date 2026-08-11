<script lang="ts" setup>
	import { ref } from 'vue'
	import { useRouter } from 'vue-router'
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

		<div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 mb-1">密码</label>
				<input
					v-model="password"
					class="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					placeholder="请输入密码"
					type="password"
					@keyup.enter="handleLogin"
				/>
			</div>

			<div v-if="error" class="text-sm text-red-500">{{ error }}</div>

			<button
				:disabled="loading"
				class="w-full py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer disabled:opacity-50"
				@click="handleLogin"
			>
				{{ loading ? '验证中...' : '登录' }}
			</button>
		</div>

		<div class="mt-4 text-center">
			<router-link class="text-sm text-gray-400 hover:text-gray-600 transition" to="/"> 返回首页 </router-link>
		</div>
	</div>
</template>
