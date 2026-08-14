<script lang="ts" setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { NAlert, NButton, NCard, NInput } from 'naive-ui';
	import { saveConfig, siteConfig } from '@/data/siteConfig';
	import { useAuth } from '@/data/auth';

	const router = useRouter();
	const { logout } = useAuth();

	const saved = ref(false);
	const error = ref('');

	async function handleSave() {
		error.value = '';
		saved.value = false;
		const ok = await saveConfig();
		if (ok) {
			saved.value = true;
			setTimeout(() => (saved.value = false), 2000);
		} else {
			error.value = '保存失败，请检查网络或服务状态';
		}
	}

	function handleLogout() {
		logout();
		router.replace('/');
	}
</script>

<template>
	<div class="max-w-2xl mx-auto">
		<!-- Breadcrumb & logout -->
		<div class="mb-6 flex items-center justify-between">
			<router-link
				class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors duration-200"
				to="/"
			>
				<span class="text-base">&larr;</span> 返回首页
			</router-link>
			<button
				class="text-sm text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
				@click="handleLogout"
			>
				退出登录
			</button>
		</div>

		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-slate-800 tracking-tight">系统配置</h1>
			<p class="text-slate-500 text-sm mt-1">按分组配置站点信息、页脚内容与登录密码，保存后立即生效</p>
		</div>

		<div class="space-y-6">
			<!-- 站点信息 -->
			<n-card size="small" title="站点信息">
				<div class="space-y-4">
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">站点名称</label>
						<n-input v-model:value="siteConfig.siteName" placeholder="例: TKU" />
					</div>
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">站点描述</label>
						<n-input v-model:value="siteConfig.siteDescription" placeholder="站点的一句话简介" />
					</div>
				</div>
			</n-card>

			<!-- 页脚设置 -->
			<n-card size="small" title="页脚设置">
				<div class="space-y-4">
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">版权归属</label>
						<n-input v-model:value="siteConfig.footer.copyright" placeholder="例: TKU" />
					</div>
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">ICP 备案号</label>
						<n-input v-model:value="siteConfig.footer.icp" placeholder="例: 京ICP备XXXXXXXX号" />
					</div>
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">备案链接</label>
						<n-input v-model:value="siteConfig.footer.icpUrl" placeholder="https://beian.miit.gov.cn" />
					</div>
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">底部声明文字</label>
						<n-input v-model:value="siteConfig.footer.poweredBy" placeholder="站点底部附加声明" />
					</div>
				</div>
			</n-card>

			<!-- 安全设置 -->
			<n-card size="small" title="安全设置">
				<div class="space-y-4">
					<div>
						<label class="block text-xs font-semibold text-slate-500 mb-1">登录密码</label>
						<n-input
							v-model:value="siteConfig.auth.password"
							placeholder="修改后下次登录使用新密码"
							show-password-toggle
							type="password"
						/>
					</div>
				</div>
			</n-card>

			<!-- 系统信息 -->
			<n-card size="small" title="系统信息">
				<div class="text-xs text-slate-500 leading-relaxed">
					<p>运行时数据：<code class="bg-slate-100 px-1 rounded">site.db</code> 存储在服务器端（SQLite）。</p>
					<p>默认配置：<code class="bg-slate-100 px-1 rounded">site.config.json</code> 仅作初始默认值。</p>
					<p>配置修改后立即持久化，刷新页面即生效。</p>
				</div>
			</n-card>

			<!-- Save -->
			<div class="flex items-center gap-3">
				<n-button type="primary" @click="handleSave"> 保存配置 </n-button>
				<n-alert v-if="saved" class="text-sm" type="success"> 配置已保存 </n-alert>
				<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>
			</div>
		</div>
	</div>
</template>
