<script lang="ts" setup>
	import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
	import { NAlert, NButton, NEmpty, NSpin } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';
	import type { VirtioFile, VirtioVersion } from '@/types/virtio';

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

	/** 左侧版本列表滚动加载哨兵元素（版本列表渲染完成后才存在） */
	const sentinel = ref<HTMLDivElement | null>(null);
	let observer: IntersectionObserver | null = null;
	/** 当前绑定的滚动容器（用于移除监听） */
	let scrollContainerEl: HTMLElement | null = null;
	/** 滚动事件节流标记 */
	let scrollTicking = false;

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

	function formatSize(size: string): string {
		// 目录列表中的尺寸以 K/M/G/T 结尾，补 B 更直观
		if (!size) return '';
		if (/[KMGTPE]$/.test(size)) return size + 'B';
		return size;
	}

	function getFileIcon(name: string): string {
		const ext = name.split('.').pop()?.toLowerCase() || '';
		if (ext === 'iso') return 'mdi:disc';
		if (ext === 'msi') return 'mdi:package-variant-closed';
		if (ext === 'exe') return 'mdi:application';
		if (ext === 'rpm') return 'mdi:package';
		if (ext === 'vfd') return 'mdi:floppy';
		return 'mdi:file-outline';
	}

	function getFileDescription(name: string): string {
		if (name.endsWith('.iso')) {
			if (name.includes('virtio-win-')) return '完整版 VirtIO 驱动 ISO';
			return 'VirtIO 驱动 ISO（symlink）';
		}
		if (name.endsWith('.msi')) {
			if (name.includes('x64')) return '64 位 Guest Tools MSI 安装包';
			if (name.includes('x86')) return '32 位 Guest Tools MSI 安装包';
			return 'MSI 安装包';
		}
		if (name.endsWith('.exe')) return 'Guest Tools 安装程序（EXE）';
		if (name.endsWith('.noarch.rpm')) return 'RPM 包（无架构依赖）';
		if (name.endsWith('.src.rpm')) return 'RPM 源码包';
		if (name.endsWith('_amd64.vfd')) return '虚拟软驱映像（64 位）';
		if (name.endsWith('_x86.vfd')) return '虚拟软驱映像（32 位）';
		return '文件';
	}

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
		let el: HTMLElement | null = sentinel.value?.parentElement ?? null;
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
		const el = sentinel.value;
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
		const el = sentinel.value;
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
		if (sentinel.value) observer.observe(sentinel.value);
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

	// 哨兵在版本列表渲染完成后才出现（loadingVersions 为 true 时不存在），
	// 用 watch 监听其出现时机，避免 onMounted 时 observe(null)。
	watch(sentinel, (el) => {
		if (el) {
			setupObserver();
			void fillViewport();
		}
	});

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

	fetchVersions();
</script>

<template>
	<div class="space-y-6">
		<!-- 错误提示 -->
		<n-alert v-if="error" closable type="error" @close="error = ''">
			{{ error }}
		</n-alert>

		<!-- 工具栏 -->
		<div
			class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
		>
			<div class="flex items-center gap-2">
				<span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
					<TkuIcon :name="icons.download" :size="14" />
					VirtIO 版本归档
				</span>
				<span v-if="!loadingVersions" class="text-[11px] text-slate-400">
					共 {{ allVersions.length }} 个版本 · 点击左侧版本查看文件
				</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-[11px] text-slate-400">
					数据来源：
					<a
						class="text-blue-500 hover:text-blue-600 underline"
						href="https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/"
						rel="noopener noreferrer"
						target="_blank"
					>
						fedorapeople.org
					</a>
				</span>
				<n-button :disabled="loadingVersions" secondary size="small" @click="fetchVersions">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.refresh" :size="14" />
						刷新
					</span>
				</n-button>
			</div>
		</div>

		<!-- 左右分栏：左 1/3 版本列表，右 2/3 文件列表 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- 左侧：版本列表（1/3，独立滚动 + 滚动加载） -->
			<div
				class="h-[50vh] overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-3 lg:col-span-1 lg:h-[calc(100vh-260px)]"
			>
				<div v-if="loadingVersions" class="flex items-center justify-center py-16">
					<n-spin size="medium" />
				</div>

				<div v-else-if="visibleVersions.length === 0" class="py-8">
					<n-empty description="暂无可用版本" />
				</div>

				<div v-else class="space-y-2">
					<div
						v-for="v in visibleVersions"
						:key="v.name"
						:class="
							selectedVersion === v.name
								? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-200'
								: 'border-transparent hover:border-slate-200 hover:bg-slate-50'
						"
						class="flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-all duration-200"
						@click="selectVersion(v.name)"
					>
						<div class="min-w-0">
							<div
								:class="selectedVersion === v.name ? 'text-blue-700' : 'text-slate-700'"
								class="truncate text-sm font-medium"
							>
								{{ v.name }}
							</div>
							<div class="mt-0.5 text-[11px] text-slate-400">{{ v.date }}</div>
						</div>
						<TkuIcon
							v-if="selectedVersion === v.name"
							:name="icons.check"
							:size="16"
							class="flex-shrink-0 text-blue-500"
						/>
					</div>

					<!-- 滚动加载哨兵 + 底部状态 -->
					<div ref="sentinel" class="flex h-10 items-center justify-center py-4">
						<span v-if="hasMore" class="text-xs text-slate-400">
							<TkuIcon :name="icons.chevronDown" :size="14" class="mr-1 inline animate-bounce" />
							向下滚动加载更多
						</span>
						<span v-else class="text-[11px] text-slate-400">已加载全部 {{ allVersions.length }} 个版本</span>
					</div>
				</div>
			</div>

			<!-- 右侧：文件列表（2/3） -->
			<div
				class="flex h-[45vh] flex-col rounded-xl border border-slate-200/80 bg-white p-4 lg:col-span-2 lg:h-[calc(100vh-260px)]"
			>
				<!-- 面板头部：当前选中版本 -->
				<div class="mb-3 flex flex-shrink-0 items-center justify-between gap-3 border-b border-slate-100 pb-3">
					<div class="flex min-w-0 items-center gap-2.5">
						<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
							<TkuIcon :name="icons.download" :size="18" />
						</div>
						<div class="min-w-0">
							<div class="truncate text-sm font-semibold text-slate-700">
								{{ selectedVersionInfo?.name ?? '未选择版本' }}
							</div>
							<div v-if="selectedVersionInfo" class="text-[11px] text-slate-400">
								发布日期：{{ selectedVersionInfo.date }}
							</div>
						</div>
					</div>
					<span v-if="!selectedLoading && selectedFiles.length > 0" class="flex-shrink-0 text-[11px] text-slate-400">
						{{ selectedFiles.length }} 个文件 · 点击文件开始下载
					</span>
				</div>

				<!-- 面板内容 -->
				<div class="min-h-0 flex-1 overflow-y-auto">
					<div v-if="!selectedVersion" class="flex h-full flex-col items-center justify-center text-center">
						<div class="mb-3 text-slate-300">
							<TkuIcon :name="icons.download" :size="48" />
						</div>
						<p class="text-sm text-slate-500">请在左侧选择一个版本</p>
					</div>

					<div v-else-if="selectedLoading" class="flex h-full items-center justify-center">
						<n-spin size="medium" />
					</div>

					<div v-else-if="selectedFiles.length === 0" class="py-8">
						<n-empty description="暂无可用文件" />
					</div>

					<div v-else class="space-y-1.5">
						<div
							v-for="f in selectedFiles"
							:key="f.name"
							class="group flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
							@click="triggerDownload(selectedVersion!, f.name)"
						>
							<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white text-slate-400">
								<TkuIcon :name="getFileIcon(f.name)" :size="16" />
							</div>
							<div class="min-w-0 flex-1">
								<div class="truncate text-sm font-medium text-slate-700">{{ f.name }}</div>
								<div class="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
									<span>{{ getFileDescription(f.name) }}</span>
									<span v-if="f.size" class="font-mono">{{ formatSize(f.size) }}</span>
									<span v-if="f.date" class="text-slate-300">·</span>
									<span v-if="f.date">{{ f.date }}</span>
								</div>
							</div>
							<n-button
								class="opacity-0 transition group-hover:opacity-100"
								secondary
								size="tiny"
								@click.stop="triggerDownload(selectedVersion!, f.name)"
							>
								<span class="flex items-center gap-1">
									<TkuIcon :name="icons.download" :size="12" />
									下载
								</span>
							</n-button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 下载提示 -->
		<p v-if="downloadProgress" class="text-xs text-blue-600">正在下载 {{ downloadProgress }}... 文件较大请耐心等待。</p>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于 VirtIO 驱动</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				VirtIO 是 KVM/QEMU 虚拟化环境的半虚拟化（paravirtualized）驱动标准，为 Windows
				虚拟机提供高性能的磁盘、网络、显卡等设备驱动。 安装 VirtIO 驱动后，Windows 虚拟机可以显著提升 I/O
				性能，避免使用模拟设备带来的性能瓶颈。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具允许您从 Fedora 的官方归档仓库浏览和下载 VirtIO 驱动。数据来源为
				<a
					class="font-medium text-blue-800 underline"
					href="https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/"
					rel="noopener noreferrer"
					target="_blank"
				>
					Fedora People </a
				>，涵盖了从 0.1.96 到 0.1.285 的多个历史版本归档。
			</p>
			<p class="mb-1 text-sm font-medium text-blue-800">常见文件说明</p>
			<ul class="space-y-1 text-sm leading-relaxed text-slate-600">
				<li>
					<span class="font-medium text-slate-700">virtio-win-*.iso</span> — 完整 ISO 镜像，包含所有 VirtIO 驱动。 在
					Windows 安装过程中可通过虚拟光驱挂载，加载驱动后即可识别 VirtIO 磁盘/网卡。
				</li>
				<li>
					<span class="font-medium text-slate-700">virtio-win-gt-x64/x86.msi</span> — Guest Tools MSI 安装包，安装后提供
					balloon、vioserial、pvpanic 等附加驱动。
				</li>
				<li>
					<span class="font-medium text-slate-700">virtio-win-guest-tools.exe</span> — 一体化的 Guest Tools 安装程序，含
					MSI 安装包。
				</li>
				<li>
					<span class="font-medium text-slate-700">*.noarch.rpm / *.src.rpm</span> — Linux 发行版 RPM
					包，适用于在宿主机上安装驱动工具。
				</li>
			</ul>
			<p class="mt-3 text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">使用提示</span>：下载后请校验 CHECKSUM
				文件以确保完整性（同一版本目录下包含 CHECKSUM 文件）。 所有文件托管在 Fedora
				官方服务器，下载链接为直链，本工具仅做目录浏览与转发。
			</p>
		</div>
	</div>
</template>
