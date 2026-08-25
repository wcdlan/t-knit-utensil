<script lang="ts" setup>
	import { ref } from 'vue';
	import { useRouter } from 'vue-router';
	import { saveConfig, siteConfig } from '@/composable/siteConfig';
	import { useAuth } from '@/composable/auth';
	import { QUICK_LINK_ICONS } from '@/data/icons';
	import type { QuickLink } from '@/types/site';
	import SettingsHeader from '@/fragment/page/settings/SettingsHeader.vue';
	import SiteInfoCard from '@/fragment/page/settings/SiteInfoCard.vue';
	import FooterCard from '@/fragment/page/settings/FooterCard.vue';
	import QuickLinksCard from '@/fragment/page/settings/QuickLinksCard.vue';
	import SecurityCard from '@/fragment/page/settings/SecurityCard.vue';
	import SystemInfoCard from '@/fragment/page/settings/SystemInfoCard.vue';
	import SaveBar from '@/fragment/page/settings/SaveBar.vue';

	const router = useRouter();
	const { logout } = useAuth();

	const saved = ref(false);
	const error = ref('');

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
	<div class="max-w-2xl mx-auto">
		<!-- SettingsHeader：面包屑与退出 + 标题区 -->
		<SettingsHeader @logout="handleLogout" />

		<div class="space-y-6">
			<!-- SiteInfoCard：站点信息（名称 / 描述） -->
			<SiteInfoCard v-model:site-description="siteConfig.siteDescription" v-model:site-name="siteConfig.siteName" />
			<!-- FooterCard：页脚设置（版权 / ICP / 声明文字） -->
			<FooterCard
				v-model:copyright="siteConfig.footer.copyright"
				v-model:icp="siteConfig.footer.icp"
				v-model:icp-url="siteConfig.footer.icpUrl"
				v-model:powered-by="siteConfig.footer.poweredBy"
			/>
			<!-- QuickLinksCard：快捷连接管理（图标 / 名称 / URL / 新标签开关） -->
			<QuickLinksCard
				:quick-links="siteConfig.quickLinks"
				@add="addQuickLink"
				@remove="removeQuickLink"
				@select-icon="selectIcon"
			/>
			<!-- SecurityCard：安全设置（登录密码） -->
			<SecurityCard v-model:password="siteConfig.auth.password" />
			<!-- SystemInfoCard：系统信息说明 -->
			<SystemInfoCard />
			<!-- SaveBar：保存按钮与保存结果提示 -->
			<SaveBar :error="error" :saved="saved" @save="handleSave" />
		</div>
	</div>
</template>
