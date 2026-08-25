<script lang="ts" setup>
	import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
	import { NAlert } from 'naive-ui';
	import type { VirtioFile, VirtioRecommendationRow, VirtioVersion } from '@/types/virtio';
	import { VIRTIO_OS_RECOMMENDATIONS } from '@/data/virtio';
	import Toolbar from '@/fragment/tool/virtualization/virtio-download/Toolbar.vue';
	import VersionList from '@/fragment/tool/virtualization/virtio-download/VersionList.vue';
	import FileList from '@/fragment/tool/virtualization/virtio-download/FileList.vue';
	import RecommendationPanel from '@/fragment/tool/virtualization/virtio-download/RecommendationPanel.vue';
	import AboutPanel from '@/fragment/tool/virtualization/virtio-download/AboutPanel.vue';

	// ---- 状态 ----

	/** 全部版本（一次拉取，前端分批渲染实现滚动加载） */
	const allVersions = ref<VirtioVersion[]>([]);
	/** 已渲染（滚动加载后可见）的版本 */
	const visibleCount = ref(0);
	/** 每次滚动加载的批次大小 */
	const PAGE_SIZE = 12;
	/** 当前选中的版本（右侧文件列表展示它） */
	const selectedVersion = ref<string | null>(null);

	/** 各版本文件列表缓存：version -> files */
	const filesCache = ref<Record<string, VirtioFile[]>>({});
	/** 各版本文件加载中状态 */
	const loadingFilesMap = ref<Record<string, boolean>>({});

	const loadingVersions = ref(true);
	const error = ref('');
	const downloadProgress = ref<string | null>(null);

	// 网络请求超时时间（毫秒）
	const FETCH_TIMEOUT = 30000;

	const BASE_URL = 'https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio';

	// ---- 计算属性 ----

	const visibleVersions = computed(() => allVersions.value.slice(0, visibleCount.value));

	const hasMore = computed(() => visibleCount.value < allVersions.value.length);

	/** 当前选中版本的文件列表 */
	const selectedFiles = computed<VirtioFile[]>(() => {
		if (!selectedVersion.value) return [];
		return filesCache.value[selectedVersion.value] ?? [];
	});

	/** 当前选中版本是否在加载文件 */
	const selectedLoading = computed(() => {
		if (!selectedVersion.value) return false;
		return !!loadingFilesMap.value[selectedVersion.value];
	});

	/** 当前选中版本的信息 */
	const selectedVersionInfo = computed<VirtioVersion | null>(() => {
		if (!selectedVersion.value) return null;
		return allVersions.value.find((v) => v.name === selectedVersion.value) ?? null;
	});

	// ---- 辅助函数 ----

	/**
	 * 从版本目录名提取核心版本号（如 virtio-win-0.1.190-1 → 0.1.190）。
	 * 归档目录名可能带 -N 构建后缀，推荐关系只关心核心版本号。
	 */
	function coreVersion(name: string): string {
		const m = /^virtio-win-(.+?)(?:-\d+)?$/.exec(name);
		return m ? m[1] : name;
	}

	/** 各 Windows 系统的推荐版本行（基于静态推荐关系 + 当前归档版本列表解析） */
	const recommendationRows = computed<VirtioRecommendationRow[]>(() => {
		if (allVersions.value.length === 0) return [];
		// API 按日期倒序返回，第一个即最新版本
		const latest = allVersions.value[0];
		return VIRTIO_OS_RECOMMENDATIONS.map((rec) => {
			if (rec.useLatest) {
				return {
					osName: rec.osName,
					isLatest: true,
					versionName: latest.name,
					versionLabel: '最新版',
					available: true
				};
			}
			// 按候选顺序找到归档中仍存在的版本，第一个即最推荐版本
			const matched = rec.recommended
				.map((ver) => allVersions.value.find((v) => coreVersion(v.name) === ver))
				.find((v): v is VirtioVersion => !!v);
			if (matched) {
				return {
					osName: rec.osName,
					isLatest: false,
					versionName: matched.name,
					versionLabel: coreVersion(matched.name),
					available: true
				};
			}
			return {
				osName: rec.osName,
				isLatest: false,
				versionName: '',
				versionLabel: rec.recommended[0] ?? '',
				available: false
			};
		});
	});

	/** 构建文件的直接下载 URL */
	function buildDownloadUrl(version: string, filename: string): string {
		return `${BASE_URL}/${version}/${filename}`;
	}

	/** 触发浏览器下载 */
	function triggerDownload(version: string, filename: string) {
		const url = buildDownloadUrl(version, filename);
		downloadProgress.value = `${version} / ${filename}`;
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.target = '_blank';
		a.rel = 'noopener noreferrer';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		// 文件较大时下载不会立即结束，短暂提示后复位
		setTimeout(() => {
			downloadProgress.value = null;
		}, 3000);
	}

	// ---- 左侧版本列表滚动加载 ----

	/** 当前哨兵元素（由 VersionList 通过 sentinel-change 事件上报） */
	let sentinelEl: HTMLDivElement | null = null;
	let observer: IntersectionObserver | null = null;
	/** 当前绑定的滚动容器（用于移除监听） */
	let scrollContainerEl: HTMLElement | null = null;
	/** 滚动事件节流标记 */
	let scrollTicking = false;

	function loadMore() {
		if (hasMore.value) {
			visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, allVersions.value.length);
		}
	}

	/**
	 * 找到哨兵所在的滚动容器（左侧版本列表面板）。
	 * 本项目滚动发生在 n-layout-content 内部（而非 window），
	 * 因此需要向上查找 overflow-y 为 auto/scroll 的祖先元素。
	 */
	function getScrollContainer(): HTMLElement {
		let el: HTMLElement | null = sentinelEl?.parentElement ?? null;
		while (el && el !== document.body) {
			const style = window.getComputedStyle(el);
			if (/(auto|scroll|overlay)/.test(style.overflowY)) return el;
			el = el.parentElement;
		}
		return (document.scrollingElement ?? document.documentElement) as HTMLElement;
	}

	/**
	 * 左侧面板未铺满时持续加载，直到哨兵滑出面板可视区域或全部加载完成。
	 * 解决「内容太少、没有滚动条」时无法触发滚动加载的问题。
	 */
	async function fillViewport() {
		const el = sentinelEl;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const container = getScrollContainer();
		const crect = container.getBoundingClientRect();
		// 哨兵与滚动容器可视区域有交集 → 面板尚未铺满，继续加载下一批
		const intersects = rect.top < crect.bottom && rect.bottom > crect.top;
		if (intersects && hasMore.value) {
			loadMore();
			await nextTick();
			await fillViewport();
		}
	}

	/** 哨兵是否接近滚动容器可视区域底部（含提前量） */
	function isSentinelNearViewport(): boolean {
		const el = sentinelEl;
		if (!el) return false;
		const rect = el.getBoundingClientRect();
		const crect = getScrollContainer().getBoundingClientRect();
		const MARGIN = 600;
		return rect.top < crect.bottom + MARGIN && rect.bottom > crect.top - MARGIN;
	}

	/** 滚动/观察触发：哨兵接近可视区则加载一批，之后若仍未铺满则继续补齐 */
	async function loadAndFill() {
		if (!hasMore.value) return;
		if (!isSentinelNearViewport()) return;
		loadMore();
		await nextTick();
		await fillViewport();
	}

	/**
	 * 初始化 / 重建 IntersectionObserver 与滚动兜底监听。
	 * root 指定为实际滚动容器（左侧版本列表面板）；面板尚不可滚动（内容未铺满）时
	 * 哨兵天然可见，观察器首次回调会立即触发 loadAndFill 补齐内容。
	 */
	function setupObserver() {
		observer?.disconnect();
		observer = null;
		removeScrollListener();
		const container = getScrollContainer();
		scrollContainerEl = container;
		const isViewport = container === document.scrollingElement || container === document.documentElement;
		observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					void loadAndFill();
				}
			},
			{ root: isViewport ? null : container, rootMargin: '600px 0px' }
		);
		if (sentinelEl) observer.observe(sentinelEl);
		// 滚动兜底：IntersectionObserver 仅在状态变化时回调，
		// 快速滚动（如一次滚到底）可能越过哨兵，用 scroll 监听补上。
		container.addEventListener('scroll', onScroll, { passive: true });
	}

	function onScroll() {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(() => {
			scrollTicking = false;
			void loadAndFill();
		});
	}

	function removeScrollListener() {
		if (scrollContainerEl) {
			scrollContainerEl.removeEventListener('scroll', onScroll);
			scrollContainerEl = null;
		}
	}

	/** VersionList 内哨兵元素出现/变化时上报：出现后搭建观察器并补齐面板内容 */
	function onSentinelChange(el: HTMLDivElement | null) {
		sentinelEl = el;
		if (el) {
			setupObserver();
			void fillViewport();
		}
	}

	onBeforeUnmount(() => {
		observer?.disconnect();
		observer = null;
		removeScrollListener();
	});

	// ---- 数据获取 ----

	async function fetchVersions() {
		loadingVersions.value = true;
		error.value = '';
		try {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
			const resp = await fetch('/api/virtio?action=versions', { signal: controller.signal });
			clearTimeout(timer);
			const data = await resp.json();
			if (data.ok) {
				allVersions.value = data.versions as VirtioVersion[];
				visibleCount.value = Math.min(PAGE_SIZE, allVersions.value.length);
				// 默认选中最新版本（API 按日期倒序，第一个即最新）
				if (allVersions.value.length > 0) {
					selectVersion(allVersions.value[0].name);
				}
			} else {
				error.value = data.error || '无法获取版本列表';
			}
		} catch (e: any) {
			error.value = '请求失败: ' + (e.name === 'AbortError' ? '请求超时' : e.message);
		} finally {
			loadingVersions.value = false;
		}
	}

	async function fetchFiles(version: string) {
		// 已有缓存则直接使用
		if (filesCache.value[version]) return;
		loadingFilesMap.value[version] = true;
		try {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
			const resp = await fetch(`/api/virtio?action=files&version=${encodeURIComponent(version)}`, {
				signal: controller.signal
			});
			clearTimeout(timer);
			const data = await resp.json();
			if (data.ok) {
				filesCache.value[version] = data.files as VirtioFile[];
			} else {
				filesCache.value[version] = [];
				error.value = data.error || `无法获取 ${version} 的文件列表`;
			}
		} catch (e: any) {
			filesCache.value[version] = [];
			error.value = `获取 ${version} 文件列表失败: ` + (e.name === 'AbortError' ? '请求超时' : e.message);
		} finally {
			loadingFilesMap.value[version] = false;
		}
	}

	/** 点击版本：选中并加载文件列表（已有缓存直接展示） */
	function selectVersion(version: string) {
		selectedVersion.value = version;
		if (!filesCache.value[version]) {
			fetchFiles(version);
		}
	}

	/** 点击推荐版本：选中该版本，并确保其出现在左侧可见列表中（必要时一次性补齐渲染） */
	function selectRecommended(version: string) {
		const idx = allVersions.value.findIndex((v) => v.name === version);
		if (idx >= 0) {
			visibleCount.value = Math.max(visibleCount.value, idx + 1);
		}
		selectVersion(version);
	}

	fetchVersions();
</script>

<template>
	<div class="space-y-6">
		<!-- 错误提示 -->
		<n-alert v-if="error" closable type="error" @close="error = ''">
			{{ error }}
		</n-alert>

		<!-- 工具栏 -->
		<!-- Toolbar：工具栏（版本总数统计 + 刷新按钮） -->
		<Toolbar :loading="loadingVersions" :total-count="allVersions.length" @refresh="fetchVersions" />

		<!-- 推荐版本面板 -->
		<!-- RecommendationPanel：各 Windows 系统推荐 VirtIO 驱动版本，点击快速选中 -->
		<RecommendationPanel
			:loading="loadingVersions"
			:rows="recommendationRows"
			:selected="selectedVersion"
			@select="selectRecommended"
		/>

		<!-- 左右分栏：左 1/3 版本列表，右 2/3 文件列表 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- 左侧：版本列表（1/3，独立滚动 + 滚动加载） -->
			<!-- VersionList：左侧版本列表（1/3 宽，滚动加载 + 哨兵上报，点击选中版本） -->
			<VersionList
				:has-more="hasMore"
				:loading="loadingVersions"
				:selected="selectedVersion"
				:total-count="allVersions.length"
				:versions="visibleVersions"
				@select="selectVersion"
				@sentinel-change="onSentinelChange"
			/>

			<!-- 右侧：文件列表（2/3） -->
			<!-- FileList：右侧文件列表（2/3 宽，展示选中版本的文件与下载按钮） -->
			<FileList
				:files="selectedFiles"
				:loading="selectedLoading"
				:version="selectedVersionInfo"
				@download="triggerDownload"
			/>
		</div>

		<!-- 下载提示 -->
		<p v-if="downloadProgress" class="text-xs text-blue-600">正在下载 {{ downloadProgress }}... 文件较大请耐心等待。</p>

		<!-- 介绍 -->
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
