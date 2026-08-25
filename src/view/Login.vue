<script lang="ts" setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { useAuth } from '@/composable/auth';
	import BrandPanel from '@/fragment/page/login/BrandPanel.vue';
	import LoginForm from '@/fragment/page/login/LoginForm.vue';
	import BackHomeLink from '@/fragment/page/login/BackHomeLink.vue';

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
			router.replace('/admin/config');
		} else {
			error.value = '密码错误';
			password.value = '';
		}
	}
</script>

<template>
	<div class="min-h-[70vh] flex items-center justify-center">
		<div class="w-full max-w-sm">
			<!-- BrandPanel：品牌区（Logo 徽标 + 标题 + 副标题） -->
			<BrandPanel />
			<!-- LoginForm：登录卡片（密码输入 + 错误提示 + 登录按钮） -->
			<LoginForm v-model:password="password" :error="error" :loading="loading" @login="handleLogin" />
			<!-- BackHomeLink：返回首页链接 -->
			<BackHomeLink />
		</div>
	</div>
</template>
