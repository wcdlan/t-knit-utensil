<script lang="ts" setup>
	import { computed, nextTick, ref } from 'vue';
	import JSZip from 'jszip';
	import { downloadBlob } from '@/utils/download';
	import { dataUrlToArrayBuffer, encodeICO } from '@/utils/favicon';
	import type { FaviconSize } from '@/types/image';
	import UploadArea from '@/fragment/tool/image/favicon/UploadArea.vue';
	import CropCanvas from '@/fragment/tool/image/favicon/CropCanvas.vue';
	import CropControls from '@/fragment/tool/image/favicon/CropControls.vue';
	import SizeSelector from '@/fragment/tool/image/favicon/SizeSelector.vue';
	import FormatSelector from '@/fragment/tool/image/favicon/FormatSelector.vue';
	import PreviewGrid from '@/fragment/tool/image/favicon/PreviewGrid.vue';
	import UsageTips from '@/fragment/tool/image/favicon/UsageTips.vue';
	import AboutPanel from '@/fragment/tool/image/favicon/AboutPanel.vue';

	// --- 状态 ---
	const faviconSizes = ref<FaviconSize[]>([
		{ size: 16, label: '16×16', selected: false },
		{ size: 32, label: '32×32', selected: true },
		{ size: 48, label: '48×48', selected: true },
		{ size: 64, label: '64×64', selected: true },
		{ size: 128, label: '128×128', selected: false },
		{ size: 256, label: '256×256', selected: false },
		{ size: 512, label: '512×512', selected: false }
	]);

	const outputFormats = ref({ png: true, ico: false });

	const selectedFormats = computed(() => {
		const fmts: ('png' | 'ico')[] = [];
		if (outputFormats.value.png) fmts.push('png');
		if (outputFormats.value.ico) fmts.push('ico');
		return fmts;
	});
	const sourceImage = ref<HTMLImageElement | null>(null);
	const sourceDataUrl = ref<string>('');
	const isDragging = ref(false);
	const uploading = ref(false);
	const generating = ref(false);
	let wheelDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	// 生成结果：尺寸 -> data URL 映射
	const generatedFavicons = ref<Map<number, string>>(new Map());

	// 裁剪状态（图像像素坐标）
	const crop = ref({ x: 0, y: 0, size: 256 });
	const imageNatural = ref({ w: 0, h: 0 });

	// 计算属性
	const displaySize = ref(320);

	const selectedSizes = computed(() => faviconSizes.value.filter((s) => s.selected).map((s) => s.size));

	// --- 图片加载 ---
	function loadImageFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		uploading.value = true;
		generatedFavicons.value.clear();

		const reader = new FileReader();
		reader.onload = () => {
			const url = reader.result as string;
			sourceDataUrl.value = url;
			const img = new Image();
			img.onload = async () => {
				sourceImage.value = img;
				imageNatural.value = { w: img.naturalWidth, h: img.naturalHeight };
				const minDim = Math.min(img.naturalWidth, img.naturalHeight);
				crop.value = {
					x: Math.round((img.naturalWidth - minDim) / 2),
					y: Math.round((img.naturalHeight - minDim) / 2),
					size: minDim
				};
				uploading.value = false;
				await nextTick();
				generateAll();
			};
			img.src = url;
		};
		reader.readAsDataURL(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files?.[0];
		if (file) loadImageFile(file);
	}

	// --- Favicon 生成 ---
	function debouncedGenerate() {
		if (wheelDebounceTimer) clearTimeout(wheelDebounceTimer);
		wheelDebounceTimer = setTimeout(() => {
			wheelDebounceTimer = null;
			generateAll();
		}, 200);
	}

	function generateFavicon(size: number): string {
		const img = sourceImage.value;
		if (!img) return '';

		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext('2d')!;

		ctx.drawImage(img, crop.value.x, crop.value.y, crop.value.size, crop.value.size, 0, 0, size, size);

		return canvas.toDataURL('image/png');
	}

	function generateAll() {
		generating.value = true;
		requestAnimationFrame(() => {
			const newMap = new Map<number, string>();
			for (const s of faviconSizes.value) {
				newMap.set(s.size, generateFavicon(s.size));
			}
			generatedFavicons.value = newMap;
			generating.value = false;
		});
	}

	// --- 下载辅助 ---
	function downloadSingle(size: number, format: 'png' | 'ico') {
		const dataUrl = generatedFavicons.value.get(size);
		if (!dataUrl) return;

		if (format === 'ico') {
			dataUrlToArrayBuffer(dataUrl).then((buf) => {
				const icoBuf = encodeICO([buf]);
				downloadBlob(new Blob([icoBuf]), `favicon-${size}x${size}.ico`);
			});
		} else {
			const a = document.createElement('a');
			a.href = dataUrl;
			a.download = `favicon-${size}x${size}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	async function downloadZip() {
		const sizes = selectedSizes.value;
		const fmts = selectedFormats.value;
		if (!sizes.length || !fmts.length) return;

		const zip = new JSZip();

		for (const size of sizes) {
			const dataUrl = generatedFavicons.value.get(size);
			if (!dataUrl) continue;
			const buf = await dataUrlToArrayBuffer(dataUrl);

			if (fmts.includes('png')) {
				zip.file(`favicon-${size}x${size}.png`, buf);
			}
			if (fmts.includes('ico')) {
				const icoBuf = encodeICO([buf]);
				zip.file(`favicon-${size}x${size}.ico`, icoBuf);
			}
		}

		const blob = await zip.generateAsync({ type: 'blob' });
		downloadBlob(blob, 'favicon.zip');
	}

	// --- 生命周期 ---
	function clearImage() {
		sourceImage.value = null;
		sourceDataUrl.value = '';
		generatedFavicons.value.clear();
	}

	function setDefaultCrop() {
		if (!sourceImage.value) return;
		const img = sourceImage.value;
		const minDim = Math.min(img.naturalWidth, img.naturalHeight);
		crop.value = {
			x: Math.round((img.naturalWidth - minDim) / 2),
			y: Math.round((img.naturalHeight - minDim) / 2),
			size: minDim
		};
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function toggleSize(size: number) {
		const s = faviconSizes.value.find((item) => item.size === size);
		if (s) {
			s.selected = !s.selected;
			generateAll();
		}
	}
</script>

<template>
	<div class="space-y-6" @dragover="onDragOver" @drop="handleDrop">
		<!-- 上传区域 -->
		<!-- UploadArea：图片上传区域（点击或拖拽选择源图，未上传前展示） -->
		<UploadArea v-if="!sourceImage" @file-selected="loadImageFile" />

		<!-- 主编辑区 -->
		<div v-else class="flex flex-col gap-6 lg:flex-row">
			<!-- 左侧：裁剪区域 -->
			<div class="shrink-0">
				<p class="mb-2 text-sm font-medium text-gray-500">裁剪区域（拖动调整位置，滚轮调整大小）</p>
				<!-- CropCanvas：裁剪画布（拖动调整裁剪区域位置，滚轮调整大小） -->
				<CropCanvas
					v-if="sourceImage"
					:crop="crop"
					:display-size="displaySize"
					:generating="generating"
					:image-natural="imageNatural"
					:is-dragging="isDragging"
					:source-image="sourceImage"
					:uploading="uploading"
					@generate="debouncedGenerate"
					@update:crop="(v) => (crop = v)"
					@update:is-dragging="(v: boolean) => (isDragging = v)"
				/>
				<!-- CropControls：裁剪控制按钮（恢复默认裁剪 / 重新选择图片） -->
				<CropControls
					:natural-h="imageNatural.h"
					:natural-w="imageNatural.w"
					@reset="setDefaultCrop"
					@change-image="clearImage"
				/>
			</div>

			<!-- 右侧：设置与预览 -->
			<div class="min-w-0 flex-1 space-y-5">
				<!-- SizeSelector：favicon 目标尺寸勾选列表（16~512 px） -->
				<SizeSelector :sizes="faviconSizes" @toggle-size="toggleSize" />

				<!-- FormatSelector：输出格式选择（PNG / ICO 开关） -->
				<FormatSelector
					:ico="outputFormats.ico"
					:png="outputFormats.png"
					@update:png="(v: boolean) => (outputFormats.png = v)"
					@update:ico="(v: boolean) => (outputFormats.ico = v)"
				/>

				<!-- PreviewGrid：生成结果预览网格（各尺寸预览图 + 单个下载 + 打包下载 zip） -->
				<PreviewGrid
					:can-download-zip="selectedSizes.length > 0 && selectedFormats.length > 0"
					:favicons="generatedFavicons"
					:ico="outputFormats.ico"
					:png="outputFormats.png"
					:sizes="faviconSizes"
					@download-zip="downloadZip"
					@download-single="downloadSingle"
				/>

				<!-- UsageTips：使用技巧提示（如何接入网站 head 等） -->
				<UsageTips />
				<!-- AboutPanel：工具简介与使用说明 -->
				<AboutPanel />
			</div>
		</div>
	</div>
</template>
