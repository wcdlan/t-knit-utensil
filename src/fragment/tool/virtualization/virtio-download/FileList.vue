<script lang="ts" setup>
	import { NButton, NEmpty, NSpin } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { VirtioFile, VirtioVersion } from '@/types/virtio';

	defineProps<{
		version: VirtioVersion | null;
		files: VirtioFile[];
		loading: boolean;
	}>();

	const emit = defineEmits<{
		download: [version: string, filename: string];
	}>();

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
</script>

<template>
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
						{{ version?.name ?? '未选择版本' }}
					</div>
					<div v-if="version" class="text-[11px] text-slate-400">发布日期：{{ version.date }}</div>
				</div>
			</div>
			<span v-if="!loading && files.length > 0" class="flex-shrink-0 text-[11px] text-slate-400">
				{{ files.length }} 个文件 · 点击文件开始下载
			</span>
		</div>

		<!-- 面板内容 -->
		<div class="min-h-0 flex-1 overflow-y-auto">
			<div v-if="!version" class="flex h-full flex-col items-center justify-center text-center">
				<div class="mb-3 text-slate-300">
					<TkuIcon :name="icons.download" :size="48" />
				</div>
				<p class="text-sm text-slate-500">请在左侧选择一个版本</p>
			</div>

			<div v-else-if="loading" class="flex h-full items-center justify-center">
				<n-spin size="medium" />
			</div>

			<div v-else-if="files.length === 0" class="py-8">
				<n-empty description="暂无可用文件" />
			</div>

			<div v-else class="space-y-1.5">
				<div
					v-for="f in files"
					:key="f.name"
					class="group flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
					@click="emit('download', version!.name, f.name)"
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
						@click.stop="emit('download', version!.name, f.name)"
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
</template>
