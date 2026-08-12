<script lang="ts" setup>
	import { computed, nextTick, ref } from 'vue';
	import JSZip from 'jszip';
	import { NAlert, NButton, NCheckbox } from 'naive-ui';
	import { downloadBlob } from '@/utils/download';
	import type { FaviconSize } from '@/types/image';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	// --- State ---
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
	// Generated results: map of size -> data URL
	const generatedFavicons = ref<Map<number, string>>(new Map());

	// Crop state (values in image-pixel coordinates)
	const crop = ref({ x: 0, y: 0, size: 256 });
	const imageNatural = ref({ w: 0, h: 0 });

	// Canvas refs
	const previewCanvas = ref<HTMLCanvasElement | null>(null);
	const fileInput = ref<HTMLInputElement | null>(null);

	// Drag state for crop box
	const dragStart = ref({ x: 0, y: 0, cropX: 0, cropY: 0 });

	// Computed
	const displaySize = ref(320);

	const selectedSizes = computed(() => faviconSizes.value.filter((s) => s.selected).map((s) => s.size));

	// 将原图按 contain 方式缩放到 displaySize 正方形画布内，统一缩放 + 偏移
	const imageTransform = computed(() => {
		const { w, h } = imageNatural.value;
		if (!w || !h) return { scale: 1, offsetX: 0, offsetY: 0, drawW: displaySize.value, drawH: displaySize.value };
		const scale = Math.min(displaySize.value / w, displaySize.value / h);
		const drawW = w * scale;
		const drawH = h * scale;
		const offsetX = (displaySize.value - drawW) / 2;
		const offsetY = (displaySize.value - drawH) / 2;
		return { scale, offsetX, offsetY, drawW, drawH };
	});

	const cropSquare = computed(() => {
		const img = sourceImage.value;
		if (!img) return { x: 0, y: 0, size: displaySize.value };
		const { scale, offsetX, offsetY } = imageTransform.value;
		return {
			x: crop.value.x * scale + offsetX,
			y: crop.value.y * scale + offsetY,
			size: crop.value.size * scale
		};
	});

	// --- Image loading ---
	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) loadImageFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files?.[0];
		if (file) loadImageFile(file);
	}

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
				drawPreview();
				generateAll();
			};
			img.src = url;
		};
		reader.readAsDataURL(file);
	}

	// --- Preview rendering ---
	function drawPreview() {
		const canvas = previewCanvas.value;
		const img = sourceImage.value;
		if (!canvas || !img) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = displaySize.value * dpr;
		canvas.height = displaySize.value * dpr;
		canvas.style.width = displaySize.value + 'px';
		canvas.style.height = displaySize.value + 'px';
		const ctx = canvas.getContext('2d')!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.fillStyle = '#eff6ff';
		ctx.fillRect(0, 0, displaySize.value, displaySize.value);

		const { offsetX, offsetY, drawW, drawH } = imageTransform.value;
		ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

		const cs = cropSquare.value;
		ctx.fillStyle = 'rgba(0,0,0,0.55)';
		ctx.fillRect(0, 0, displaySize.value, cs.y);
		ctx.fillRect(0, cs.y, cs.x, cs.size);
		ctx.fillRect(cs.x + cs.size, cs.y, displaySize.value - cs.x - cs.size, cs.size);
		ctx.fillRect(0, cs.y + cs.size, displaySize.value, displaySize.value - cs.y - cs.size);

		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 2;
		ctx.strokeRect(cs.x, cs.y, cs.size, cs.size);

		const handleSize = 8;
		ctx.fillStyle = '#3b82f6';
		const corners = [
			[cs.x, cs.y],
			[cs.x + cs.size, cs.y],
			[cs.x, cs.y + cs.size],
			[cs.x + cs.size, cs.y + cs.size]
		];
		for (const [cx, cy] of corners) {
			ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
		}
	}

	// --- Crop interaction ---
	function getCanvasPos(e: PointerEvent | WheelEvent): { x: number; y: number } {
		const canvas = previewCanvas.value!;
		const rect = canvas.getBoundingClientRect();
		const scaleX = displaySize.value / rect.width;
		const scaleY = displaySize.value / rect.height;
		return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
	}

	function canvasToImage(canvasX: number, canvasY: number): { x: number; y: number } | null {
		const { scale, offsetX, offsetY, drawW, drawH } = imageTransform.value;
		const inImgX = canvasX >= offsetX && canvasX <= offsetX + drawW;
		const inImgY = canvasY >= offsetY && canvasY <= offsetY + drawH;
		if (!inImgX || !inImgY) return null;
		return {
			x: (canvasX - offsetX) / scale,
			y: (canvasY - offsetY) / scale
		};
	}

	function onPointerDown(e: PointerEvent) {
		if (!sourceImage.value) return;
		const pos = getCanvasPos(e);
		const cs = cropSquare.value;
		const margin = 10;
		const inBox =
			pos.x >= cs.x - margin &&
			pos.x <= cs.x + cs.size + margin &&
			pos.y >= cs.y - margin &&
			pos.y <= cs.y + cs.size + margin;

		const imgPt = canvasToImage(pos.x, pos.y);

		if (inBox) {
			isDragging.value = true;
			dragStart.value = { x: pos.x, y: pos.y, cropX: crop.value.x, cropY: crop.value.y };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		} else if (imgPt) {
			const { w, h } = imageNatural.value;
			const newSize = Math.max(16, Math.min(crop.value.size, Math.min(w, h)));
			let nx = imgPt.x - newSize / 2;
			let ny = imgPt.y - newSize / 2;
			nx = Math.max(0, Math.min(nx, w - newSize));
			ny = Math.max(0, Math.min(ny, h - newSize));
			crop.value = { x: Math.round(nx), y: Math.round(ny), size: Math.round(newSize) };
			isDragging.value = true;
			dragStart.value = { x: pos.x, y: pos.y, cropX: crop.value.x, cropY: crop.value.y };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
			drawPreview();
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging.value) return;
		const pos = getCanvasPos(e);
		const scale = imageTransform.value.scale;
		const dx = (pos.x - dragStart.value.x) / scale;
		const dy = (pos.y - dragStart.value.y) / scale;

		let newX = dragStart.value.cropX + dx;
		let newY = dragStart.value.cropY + dy;

		newX = Math.max(0, Math.min(newX, imageNatural.value.w - crop.value.size));
		newY = Math.max(0, Math.min(newY, imageNatural.value.h - crop.value.size));

		crop.value = { ...crop.value, x: Math.round(newX), y: Math.round(newY) };
		drawPreview();
	}

	function onPointerUp() {
		if (isDragging.value) {
			isDragging.value = false;
			generateAll();
		}
	}

	function onWheel(e: WheelEvent) {
		if (!sourceImage.value) return;
		e.preventDefault();
		const pos = getCanvasPos(e);
		const imgPt = canvasToImage(pos.x, pos.y);
		const { w, h } = imageNatural.value;

		const step = Math.max(8, Math.round(crop.value.size * 0.05));
		const delta = e.deltaY > 0 ? -step : step;
		const maxSize = Math.min(w, h);
		const newSize = Math.max(16, Math.min(crop.value.size + delta, maxSize));
		if (newSize === crop.value.size) return;

		const ratio = newSize / crop.value.size;
		let cx: number, cy: number;
		if (imgPt) {
			// new top-left that keeps cursor at same proportional position
			cx = imgPt.x - (imgPt.x - crop.value.x) * ratio;
			cy = imgPt.y - (imgPt.y - crop.value.y) * ratio;
		} else {
			// center-zoom: new top-left
			cx = crop.value.x + (crop.value.size - newSize) / 2;
			cy = crop.value.y + (crop.value.size - newSize) / 2;
		}
		crop.value = {
			x: Math.round(Math.max(0, Math.min(cx, w - newSize))),
			y: Math.round(Math.max(0, Math.min(cy, h - newSize))),
			size: Math.round(newSize)
		};
		drawPreview();
		debouncedGenerate();
	}

	// --- Favicon generation ---
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

	// --- ICO encoding ---
	function encodeICO(pngBuffers: ArrayBuffer[]): ArrayBuffer {
		const count = pngBuffers.length;
		const headerSize = 6;
		const entrySize = 16;
		const dirSize = headerSize + count * entrySize;

		const offsets: number[] = [];
		let offset = dirSize;
		for (const buf of pngBuffers) {
			offsets.push(offset);
			offset += buf.byteLength;
		}

		const buffer = new ArrayBuffer(offset);
		const dv = new DataView(buffer);

		dv.setUint16(0, 0, true);
		dv.setUint16(2, 1, true);
		dv.setUint16(4, count, true);

		for (let i = 0; i < count; i++) {
			const base = headerSize + i * entrySize;
			const size = Math.min(pngBuffers[i].byteLength, 256);
			dv.setUint8(base, Math.min(size, 256));
			dv.setUint8(base + 1, Math.min(size, 256));
			dv.setUint8(base + 2, 0);
			dv.setUint8(base + 3, 0);
			dv.setUint16(base + 4, 1, true);
			dv.setUint16(base + 6, 32, true);
			dv.setUint32(base + 8, pngBuffers[i].byteLength, true);
			dv.setUint32(base + 12, offsets[i], true);
		}

		const uint8 = new Uint8Array(buffer);
		for (let i = 0; i < count; i++) {
			uint8.set(new Uint8Array(pngBuffers[i]), offsets[i]);
		}

		return buffer;
	}

	// --- Download helpers ---
	async function dataUrlToArrayBuffer(dataUrl: string): Promise<ArrayBuffer> {
		const res = await fetch(dataUrl);
		return res.arrayBuffer();
	}

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

	// --- Lifecycle ---
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
</script>

<template>
	<div class="space-y-6" @dragover="onDragOver" @drop="handleDrop">
		<!-- Upload area -->
		<div
			v-if="!sourceImage"
			class="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer"
			@click="fileInput?.click()"
		>
			<input ref="fileInput" accept="image/*" class="hidden" type="file" @change="handleFileSelect" />
			<div class="mb-4 text-slate-300">
				<TkuIcon :name="icons.image" :size="48" />
			</div>
			<p class="text-gray-600 text-lg font-medium mb-1">点击上传或拖拽图片到此处</p>
			<p class="text-gray-400 text-sm">支持 PNG、JPG、GIF、WebP、SVG 等常见图片格式</p>
		</div>

		<!-- Main editor -->
		<div v-else class="flex flex-col lg:flex-row gap-6">
			<!-- Left: Crop area -->
			<div class="shrink-0">
				<p class="text-sm text-gray-500 mb-2 font-medium">裁剪区域（拖动调整位置，滚轮调整大小）</p>
				<div class="relative inline-block bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
					<canvas
						v-if="sourceImage"
						ref="previewCanvas"
						:class="{ 'cursor-grabbing': isDragging }"
						class="block cursor-move"
						@pointerdown="onPointerDown"
						@pointerleave="onPointerUp"
						@pointermove="onPointerMove"
						@pointerup="onPointerUp"
						@wheel.prevent="onWheel"
					/>
					<div v-if="uploading || generating" class="absolute inset-0 flex items-center justify-center bg-white/60">
						<div class="flex items-center gap-2 text-blue-500 text-sm">
							<span
								class="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
							/>
							{{ uploading ? '加载中...' : '生成中...' }}
						</div>
					</div>
				</div>
				<div class="flex items-center gap-4 mt-3">
					<n-button size="small" @click="setDefaultCrop"> 重置裁剪 </n-button>
					<n-button size="small" @click="clearImage"> 更换图片 </n-button>
					<span class="text-xs text-gray-400"> 原始尺寸: {{ imageNatural.w }}×{{ imageNatural.h }} </span>
				</div>
			</div>

			<!-- Right: Settings & previews -->
			<div class="flex-1 space-y-5 min-w-0">
				<!-- Size selection -->
				<div>
					<p class="text-sm text-gray-500 mb-2 font-medium">输出尺寸</p>
					<div class="flex flex-wrap gap-2">
						<div
							v-for="s in faviconSizes"
							:key="s.size"
							:class="
								s.selected
									? 'border-blue-400 bg-blue-50 text-blue-700'
									: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
							"
							class="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition"
							@click="
								s.selected = !s.selected;
								generateAll();
							"
						>
							<n-checkbox :checked="s.selected" class="pointer-events-none" />
							<span>{{ s.label }}</span>
						</div>
					</div>
				</div>

				<!-- Format selection -->
				<div>
					<p class="text-sm text-gray-500 mb-2 font-medium">输出格式</p>
					<div class="flex gap-3">
						<label
							:class="
								outputFormats.png
									? 'border-blue-400 bg-blue-50 text-blue-700'
									: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
							"
							class="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition"
						>
							<n-checkbox :checked="outputFormats.png" @update:checked="outputFormats.png = $event" />
							<span class="font-medium">PNG</span>
							<span class="text-xs opacity-70">透明背景</span>
						</label>
						<label
							:class="
								outputFormats.ico
									? 'border-blue-400 bg-blue-50 text-blue-700'
									: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
							"
							class="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition"
						>
							<n-checkbox :checked="outputFormats.ico" @update:checked="outputFormats.ico = $event" />
							<span class="font-medium">ICO</span>
							<span class="text-xs opacity-70">传统格式</span>
						</label>
					</div>
				</div>

				<!-- Preview tiles -->
				<div>
					<div class="flex items-center justify-between mb-2">
						<p class="text-sm text-gray-500 font-medium">预览</p>
						<n-button v-if="selectedSizes.length && selectedFormats.length" type="primary" @click="downloadZip">
							<span class="flex items-center gap-1.5"
								><TkuIcon :name="icons.package" :size="16" /><span>打包下载 ZIP</span></span
							>
						</n-button>
					</div>
					<div class="flex flex-wrap gap-4">
						<div v-for="s in faviconSizes" v-show="s.selected" :key="s.size" class="flex flex-col items-center gap-2">
							<div
								:class="{ 'ring-2 ring-blue-300': generatedFavicons.has(s.size) }"
								:style="{
									width: s.size + 'px',
									height: s.size + 'px'
								}"
								class="bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-center overflow-hidden"
							>
								<img
									v-if="generatedFavicons.get(s.size)"
									:src="generatedFavicons.get(s.size)!"
									:style="{
										width: s.size + 'px',
										height: s.size + 'px',
										imageRendering: s.size <= 32 ? 'pixelated' : 'auto'
									}"
									alt=""
								/>
								<span v-else class="text-xs text-gray-400">生成中...</span>
							</div>
							<span class="text-xs text-gray-500">{{ s.label }}</span>
							<div v-if="generatedFavicons.get(s.size)" class="flex gap-1.5">
								<n-button v-if="outputFormats.png" size="tiny" @click="downloadSingle(s.size, 'png')"> ↓ PNG </n-button>
								<n-button v-if="outputFormats.ico" size="tiny" @click="downloadSingle(s.size, 'ico')"> ↓ ICO </n-button>
							</div>
						</div>
					</div>
				</div>

				<!-- Usage tips -->
				<n-alert class="text-sm" type="warning">
					<template #header>
						<span class="font-medium">使用提示</span>
					</template>
					<ul class="space-y-1 text-amber-700">
						<li>• 推荐上传至少 260×260 的图片，以确保所有尺寸清晰</li>
						<li>• PNG 格式支持透明背景，是现代浏览器推荐格式</li>
						<li>• ICO 格式兼容旧版浏览器，可单独或与 PNG 同时选中</li>
						<li>• 打包下载仅包含选中的尺寸与格式</li>
					</ul>
				</n-alert>
			</div>
		</div>
	</div>
</template>
