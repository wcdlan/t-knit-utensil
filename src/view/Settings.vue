<script lang="ts" setup>
	import { onMounted, ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { saveConfig, siteConfig } from '@/composable/siteConfig';
	import { useAuth } from '@/composable/auth';
	import { QUICK_LINK_ICONS } from '@/data/icons';
	import type { QuickLink, SettingsTabKey } from '@/types/site';
	import type { SshKeygenStatus, SystemInfo } from '@/types/system';
	import { fetchSshKeygenStatus, fetchSystemInfo, installSshKeygen } from '@/utils/system';
	import SettingsHeader from '@/fragment/page/settings/SettingsHeader.vue';
	import SettingsNav from '@/fragment/page/settings/SettingsNav.vue';
	import SiteInfoCard from '@/fragment/page/settings/SiteInfoCard.vue';
	import FooterCard from '@/fragment/page/settings/FooterCard.vue';
	import QuickLinksCard from '@/fragment/page/settings/QuickLinksCard.vue';
	import SecurityCard from '@/fragment/page/settings/SecurityCard.vue';
	import SystemInfoCard from '@/fragment/page/settings/SystemInfoCard.vue';
	import SaveBar from '@/fragment/page/settings/SaveBar.vue';

	const router = useRouter();
	const { logout } = useAuth();

	// 当前激活的配置组
	const activeTab = ref<SettingsTabKey>('site');
	const saved = ref(false);
	const error = ref('');

	// 系统信息组：部署机器信息 + ssh-keygen 状态
	const systemInfo = ref<SystemInfo | null>(null);
	const sshStatus = ref<SshKeygenStatus | null>(null);
	const sysLoading = ref(true);
	const sshInstalling = ref(false);

	async function loadSystemInfo() {
		sysLoading.value = true;
		[systemInfo.value, sshStatus.value] = await Promise.all([fetchSystemInfo(), fetchSshKeygenStatus()]);
		sysLoading.value = false;
	}

	// 一键修复：请求后端自动安装 OpenSSH，完成后刷新状态
	async function fixSshKeygen() {
		sshInstalling.value = true;
		sshStatus.value = await installSshKeygen();
		sshInstalling.value = false;
	}

	onMounted(loadSystemInfo);

	function addQuickLink() {
		siteConfig.quickLinks.push({ icon: QUICK_LINK_ICONS[0].value, name: '', url: '', newTab: true });
	}

	function removeQuickLink(index: number) {
		siteConfig.quickLinks.splice(index, 1);
	}

	function selectIcon(link: QuickLink, value: string) {
		link.icon = value;
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
	<!-- 容器占视口约 60% 宽（md 以下全宽），减少两侧空白 -->
	<div class="mx-auto w-full md:max-w-[60vw]">
		<!-- SettingsHeader：面包屑与退出 + 标题区 -->
		<SettingsHeader @logout="handleLogout" />

		<!-- 左右分栏：左侧配置组子导航，右侧当前组内容 -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
			<!-- SettingsNav：配置组子导航（站点信息 / 页脚 / 快捷连接 / 安全 / 系统信息） -->
			<SettingsNav v-model:active="activeTab" />

			<div class="min-w-0">
				<!-- 切换动画：以 activeTab 为 key 的包裹层整体淡入淡出 + 轻微位移（mode=out-in 先离场再入场） -->
				<transition mode="out-in" name="tab">
					<div :key="activeTab">
						<!-- 站点信息组 -->
						<SiteInfoCard
							v-if="activeTab === 'site'"
							v-model:site-description="siteConfig.siteDescription"
							v-model:site-name="siteConfig.siteName"
						/>

						<!-- 页脚设置组 -->
						<FooterCard
							v-else-if="activeTab === 'footer'"
							v-model:copyright="siteConfig.footer.copyright"
							v-model:icp="siteConfig.footer.icp"
							v-model:icp-url="siteConfig.footer.icpUrl"
							v-model:powered-by="siteConfig.footer.poweredBy"
						/>

						<!-- 快捷连接组 -->
						<QuickLinksCard
							v-else-if="activeTab === 'quickLinks'"
							:quick-links="siteConfig.quickLinks"
							@add="addQuickLink"
							@remove="removeQuickLink"
							@select-icon="selectIcon"
						/>

						<!-- 安全设置组 -->
						<SecurityCard v-else-if="activeTab === 'security'" v-model:password="siteConfig.auth.password" />

						<!-- 系统信息组：部署机器信息 + ssh-keygen/OpenSSH 状态检测 -->
						<SystemInfoCard
							v-else-if="activeTab === 'system'"
							:info="systemInfo"
							:installing="sshInstalling"
							:loading="sysLoading"
							:ssh="sshStatus"
							@fix="fixSshKeygen"
							@refresh="loadSystemInfo"
						/>
					</div>
				</transition>

				<!-- SaveBar：保存按钮与保存结果提示（所有配置组共用，不参与切换动画） -->
				<div class="mt-6">
					<SaveBar :error="error" :saved="saved" @save="handleSave" />
				</div>
			</div>
		</div>
	</div>
</template>
