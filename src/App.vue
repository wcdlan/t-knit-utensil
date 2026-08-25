<script lang="ts" setup>
	import { onMounted } from 'vue';
	import { dateZhCN, NConfigProvider, NMessageProvider, zhCN } from 'naive-ui';
	import { themeOverrides } from '@/assets/theme';
	import { loadConfig } from '@/composable/siteConfig';
	import AppLayout from '@/layout/AppLayout.vue';

	onMounted(() => {
		loadConfig();
	});
</script>

<template>
	<n-config-provider :date-locale="dateZhCN" :locale="zhCN" :theme-overrides="themeOverrides">
		<n-message-provider>
			<AppLayout />
		</n-message-provider>
	</n-config-provider>
</template>
