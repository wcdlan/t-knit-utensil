<script lang="ts" setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { NAlert, NButton, NInput } from 'naive-ui';
	import { useAuth } from '@/data/auth';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const router = useRouter();
	const { login } = useAuth();
	const password = ref('');
	const error = ref('');
	const loading = ref(false);

	async function handleLogin() {
		if (!password.value) return;
		error.value = '';
		loading.value = true;
		const ok = await login(password.value);
		loading.value = false;
		if (ok) {
			router.replace('/settings');
		} else {
			error.value = '密码错误';
			password.value = '';
		}
	}
</script>

<template>
	<div class="min-h-[70vh] flex items-center justify-center">
		<div class="w-full max-w-sm">
			<!-- Branding -->
			<div class="text-center mb-8">
				<div
					class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
				>
					<span class="text-white">
						<TkuIcon :name="icons.lock" :size="28" />
					</span>
				</div>
				<h1 class="text-2xl font-bold text-slate-800 mb-1 tracking-tight">TKU 设置</h1>
				<p class="text-sm text-slate-500">请输入密码以访问站点设置</p>
			</div>

			<!-- Card -->
			<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
				<div class="space-y-5">
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-2">密码</label>
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

					<n-button
						:loading="loading"
						block
						class="!rounded-lg !font-medium"
						size="large"
						type="primary"
						@click="handleLogin"
					>
						{{ loading ? '验证中...' : '登录' }}
					</n-button>
				</div>
			</div>

			<div class="mt-6 text-center">
				<router-link class="text-sm text-slate-400 hover:text-slate-600 transition-colors duration-200" to="/">
					返回首页
				</router-link>
			</div>
		</div>
	</div>
</template>
