<script lang="ts" setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import { NAlert } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		buildReportText,
		collectBattery,
		collectCapabilities,
		collectGpuInfo,
		collectInfoSections,
		collectStorage,
		estimateRefreshRate,
		fetchPublicNetworkInfo,
		parseUserAgent
	} from '@/utils/browserInfo';
	import type { BrowserInfoExtras, BrowserInfoSection, CapabilityItem, GpuInfo, UserAgentInfo } from '@/types/browser';
	import AboutPanel from '@/fragment/tool/common/browser-info/AboutPanel.vue';
	import ActionBar from '@/fragment/tool/common/browser-info/ActionBar.vue';
	import InfoCard from '@/fragment/tool/common/browser-info/InfoCard.vue';
	import CapabilityGrid from '@/fragment/tool/common/browser-info/CapabilityGrid.vue';
	import UaPanel from '@/fragment/tool/common/browser-info/UaPanel.vue';

	/** UA 原文（onMounted 中读取，避免 SSR 期访问 navigator） */
	const ua = ref('');
	const uaInfo = ref<UserAgentInfo | null>(null);
	const gpu = ref<GpuInfo | null>(null);
	/** 异步补充信息：电池 / 存储配额 / 公网 IP / 刷新率 */
	const extras = ref<BrowserInfoExtras>({ battery: null, storage: null, publicNetwork: null, refreshRate: null });
	const loading = ref(false);
	const detectingRate = ref(false);
	const networkError = ref('');
	/** 视口尺寸等随窗口变化的信息通过该计数触发重算 */
	const viewportTick = ref(0);

	/** 全部信息分组（同步信息 + 异步补充信息） */
	const sections = computed<BrowserInfoSection[]>(() => {
		// 显式依赖视口变化计数，使窗口尺寸类信息实时刷新
		void viewportTick.value;
		if (!uaInfo.value || !gpu.value) return [];
		return collectInfoSections(extras.value, uaInfo.value, gpu.value);
	});

	/** 能力检测结果 */
	const capabilities = computed<CapabilityItem[]>(() => (gpu.value ? collectCapabilities(gpu.value) : []));

	/** 采集同步信息 + 异步补充信息 */
	async function collectAll() {
		loading.value = true;
		networkError.value = '';
		try {
			ua.value = navigator.userAgent;
			uaInfo.value = parseUserAgent(navigator.userAgent);
			gpu.value = collectGpuInfo();

			// 异步项互不依赖，任一失败不影响其余结果
			const [battery, storage, publicNetwork] = await Promise.allSettled([
				collectBattery(),
				collectStorage(),
				fetchPublicNetworkInfo()
			]);

			extras.value = {
				...extras.value,
				battery: battery.status === 'fulfilled' ? battery.value : null,
				storage: storage.status === 'fulfilled' ? storage.value : null,
				publicNetwork: publicNetwork.status === 'fulfilled' ? publicNetwork.value : null
			};
			if (publicNetwork.status === 'rejected') {
				networkError.value = '公网 IP 查询失败：' + (publicNetwork.reason as Error).message;
			}
		} finally {
			loading.value = false;
		}
	}

	/** 实测屏幕刷新率（rAF 采样约 1 秒） */
	async function detectRefreshRate() {
		detectingRate.value = true;
		try {
			const rate = await estimateRefreshRate();
			extras.value = { ...extras.value, refreshRate: rate || null };
		} finally {
			detectingRate.value = false;
		}
	}

	function copy(text: string) {
		if (!text) return;
		copyToClipboard(text);
	}

	/** 复制全部信息为纯文本报告 */
	function copyAll() {
		if (!sections.value.length) return;
		copyToClipboard(buildReportText(sections.value, capabilities.value, ua.value), '已复制全部浏览器信息');
	}

	/** 窗口尺寸 / 在线状态变化时刷新对应信息 */
	function handleViewportChange() {
		viewportTick.value += 1;
	}

	onMounted(() => {
		collectAll();
		detectRefreshRate();
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('online', handleViewportChange);
		window.addEventListener('offline', handleViewportChange);
	});

	onBeforeUnmount(() => {
		window.removeEventListener('resize', handleViewportChange);
		window.removeEventListener('online', handleViewportChange);
		window.removeEventListener('offline', handleViewportChange);
	});
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具说明与隐私提示 -->
		<AboutPanel />
		<!-- ActionBar：重新检测 / 检测刷新率 / 复制全部信息 -->
		<ActionBar
			:detecting-rate="detectingRate"
			:loading="loading"
			:refresh-rate-detected="extras.refreshRate !== null"
			@refresh="collectAll"
			@copy-all="copyAll"
			@detect-refresh-rate="detectRefreshRate"
		/>

		<!-- 公网 IP 查询失败提示（如服务端无外网出口） -->
		<n-alert v-if="networkError" :show-icon="true" type="warning">
			{{ networkError }}
		</n-alert>

		<!-- 信息分组卡片：浏览器 / 系统 / 屏幕 / 网络 / 存储 / 电池 / 性能 -->
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			<!-- InfoCard：单个信息分组（点击条目复制） -->
			<InfoCard v-for="section in sections" :key="section.id" :section="section" @copy="copy" />
		</div>

		<!-- CapabilityGrid：50+ 项 Web 能力支持检测 -->
		<CapabilityGrid :items="capabilities" @copy="copy" />

		<!-- UaPanel：User-Agent 原文 -->
		<UaPanel :ua="ua" @copy="copy(ua)" />
	</div>
</template>
