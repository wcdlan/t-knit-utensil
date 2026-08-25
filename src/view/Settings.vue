<script lang="ts" setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { NAlert, NButton, NCard, NInput, NPopover, NSwitch, NTooltip } from 'naive-ui';
	import { saveConfig, siteConfig } from '@/composable/siteConfig';
	import { useAuth } from '@/composable/auth';
	import { icons, QUICK_LINK_ICONS } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { QuickLink } from '@/types/site';

	const router = useRouter();
	const { logout } = useAuth();

	const saved = ref(false);
	const error = ref('');
	const linkPopoverVisible = ref(false);

	function addQuickLink() {
		siteConfig.quickLinks.push({ icon: QUICK_LINK_ICONS[0].value, name: '', url: '', newTab: true });
	}

	function removeQuickLink(index: number) {
		siteConfig.quickLinks.splice(index, 1);
	}

	function toggleLinkPopover() {
		linkPopoverVisible.value = !linkPopoverVisible.value;
	}

	function selectIcon(link: QuickLink, value: string) {
		link.icon = value;
		linkPopoverVisible.value = false;
	}

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

			<!-- 快捷连接 -->
			<n-card size="small" title="快捷连接">
				<div class="space-y-3">
					<div
						v-for="(link, index) in siteConfig.quickLinks"
						:key="index"
						class="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2"
					>
						<n-popover v-model:show="linkPopoverVisible" placement="bottom-start" trigger="click">
							<template #trigger>
								<button
									type="button"
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-500"
									@click="toggleLinkPopover"
								>
									<!-- TkuIcon：Iconify 图标封装组件（统一图标渲染入口） -->
									<TkuIcon :name="link.icon" :size="18" />
								</button>
							</template>
							<div class="grid w-[228px] grid-cols-6 gap-1">
								<button
									v-for="opt in QUICK_LINK_ICONS"
									:key="opt.value"
									:title="opt.label"
									type="button"
									class="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
									@click="selectIcon(link, opt.value)"
								>
									<TkuIcon :name="opt.value" :size="20" />
								</button>
							</div>
						</n-popover>
						<div class="w-32 shrink-0">
							<n-input v-model:value="link.name" placeholder="名称（提示）" size="small" />
						</div>
						<div class="flex-1 min-w-0">
							<n-input v-model:value="link.url" placeholder="https://..." size="small" />
						</div>
						<n-tooltip>
							<template #trigger>
								<n-switch v-model:value="link.newTab" class="shrink-0" size="small" />
							</template>
							新标签页打开
						</n-tooltip>
						<button
							type="button"
							title="删除"
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
							@click="removeQuickLink(index)"
						>
							<TkuIcon :name="icons.close" :size="16" />
						</button>
					</div>
					<n-button dashed size="small" @click="addQuickLink"> 添加快捷连接 </n-button>
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
