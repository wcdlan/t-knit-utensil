<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';

	interface CropState {
		x: number;
		y: number;
		size: number;
	}

	const props = defineProps<{
		sourceImage: HTMLImageElement | null;
		imageNatural: { w: number; h: number };
		crop: CropState;
		displaySize: number;
		isDragging: boolean;
		uploading: boolean;
		generating: boolean;
	}>();

	const emit = defineEmits<{
		'update:crop': [value: CropState];
		'update:isDragging': [value: boolean];
		generate: [];
	}>();

	const previewCanvas = ref<HTMLCanvasElement | null>(null);
	const dragStart = ref({ x: 0, y: 0, cropX: 0, cropY: 0 });

	// 将原图按 contain 方式缩放到 displaySize 正方形画布内，统一缩放 + 偏移
	const imageTransform = computed(() => {
		const { w, h } = props.imageNatural;
		if (!w || !h) return { scale: 1, offsetX: 0, offsetY: 0, drawW: props.displaySize, drawH: props.displaySize };
		const scale = Math.min(props.displaySize / w, props.displaySize / h);
		const drawW = w * scale;
		const drawH = h * scale;
		const offsetX = (props.displaySize - drawW) / 2;
		const offsetY = (props.displaySize - drawH) / 2;
		return { scale, offsetX, offsetY, drawW, drawH };
	});

	const cropSquare = computed(() => {
		const img = props.sourceImage;
		if (!img) return { x: 0, y: 0, size: props.displaySize };
		const { scale, offsetX, offsetY } = imageTransform.value;
		return {
			x: props.crop.x * scale + offsetX,
			y: props.crop.y * scale + offsetY,
			size: props.crop.size * scale
		};
	});

	function drawPreview() {
		const canvas = previewCanvas.value;
		const img = props.sourceImage;
		if (!canvas || !img) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = props.displaySize * dpr;
		canvas.height = props.displaySize * dpr;
		canvas.style.width = props.displaySize + 'px';
		canvas.style.height = 'auto';
		const ctx = canvas.getContext('2d')!;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.fillStyle = '#eff6ff';
		ctx.fillRect(0, 0, props.displaySize, props.displaySize);

		const { offsetX, offsetY, drawW, drawH } = imageTransform.value;
		ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

		const cs = cropSquare.value;
		ctx.fillStyle = 'rgba(0,0,0,0.55)';
		ctx.fillRect(0, 0, props.displaySize, cs.y);
		ctx.fillRect(0, cs.y, cs.x, cs.size);
		ctx.fillRect(cs.x + cs.size, cs.y, props.displaySize - cs.x - cs.size, cs.size);
		ctx.fillRect(0, cs.y + cs.size, props.displaySize, props.displaySize - cs.y - cs.size);

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

	function getCanvasPos(e: PointerEvent | WheelEvent): { x: number; y: number } {
		const canvas = previewCanvas.value!;
		const rect = canvas.getBoundingClientRect();
		const scaleX = props.displaySize / rect.width;
		const scaleY = props.displaySize / rect.height;
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
		if (!props.sourceImage) return;
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
			emit('update:isDragging', true);
			dragStart.value = { x: pos.x, y: pos.y, cropX: props.crop.x, cropY: props.crop.y };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		} else if (imgPt) {
			const { w, h } = props.imageNatural;
			const newSize = Math.max(16, Math.min(props.crop.size, Math.min(w, h)));
			let nx = imgPt.x - newSize / 2;
			let ny = imgPt.y - newSize / 2;
			nx = Math.max(0, Math.min(nx, w - newSize));
			ny = Math.max(0, Math.min(ny, h - newSize));
			emit('update:crop', { x: Math.round(nx), y: Math.round(ny), size: Math.round(newSize) });
			emit('update:isDragging', true);
			dragStart.value = { x: pos.x, y: pos.y, cropX: props.crop.x, cropY: props.crop.y };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!props.isDragging) return;
		const pos = getCanvasPos(e);
		const scale = imageTransform.value.scale;
		const dx = (pos.x - dragStart.value.x) / scale;
		const dy = (pos.y - dragStart.value.y) / scale;

		let newX = dragStart.value.cropX + dx;
		let newY = dragStart.value.cropY + dy;

		newX = Math.max(0, Math.min(newX, props.imageNatural.w - props.crop.size));
		newY = Math.max(0, Math.min(newY, props.imageNatural.h - props.crop.size));

		emit('update:crop', { ...props.crop, x: Math.round(newX), y: Math.round(newY) });
	}

	function onPointerUp() {
		if (props.isDragging) {
			emit('update:isDragging', false);
			emit('generate');
		}
	}

	function onWheel(e: WheelEvent) {
		if (!props.sourceImage) return;
		e.preventDefault();
		const pos = getCanvasPos(e);
		const imgPt = canvasToImage(pos.x, pos.y);
		const { w, h } = props.imageNatural;

		const step = Math.max(8, Math.round(props.crop.size * 0.05));
		const delta = e.deltaY > 0 ? -step : step;
		const maxSize = Math.min(w, h);
		const newSize = Math.max(16, Math.min(props.crop.size + delta, maxSize));
		if (newSize === props.crop.size) return;

		const ratio = newSize / props.crop.size;
		let cx: number, cy: number;
		if (imgPt) {
			// new top-left that keeps cursor at same proportional position
			cx = imgPt.x - (imgPt.x - props.crop.x) * ratio;
			cy = imgPt.y - (imgPt.y - props.crop.y) * ratio;
		} else {
			// center-zoom: new top-left
			cx = props.crop.x + (props.crop.size - newSize) / 2;
			cy = props.crop.y + (props.crop.size - newSize) / 2;
		}
		emit('update:crop', {
			x: Math.round(Math.max(0, Math.min(cx, w - newSize))),
			y: Math.round(Math.max(0, Math.min(cy, h - newSize))),
			size: Math.round(newSize)
		});
		emit('generate');
	}

	// 任一依赖变化时重绘
	watch([() => props.sourceImage, () => props.crop, () => props.displaySize], () => {
		drawPreview();
	});
</script>

<template>
	<div class="relative block overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm">
		<canvas
			v-if="sourceImage"
			ref="previewCanvas"
			:class="{ 'cursor-grabbing': isDragging }"
			class="block h-auto max-w-full cursor-move"
			@pointerdown="onPointerDown"
			@pointerleave="onPointerUp"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@wheel.prevent="onWheel"
		/>
		<div v-if="uploading || generating" class="absolute inset-0 flex items-center justify-center bg-white/60">
			<div class="flex items-center gap-2 text-sm text-blue-500">
				<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
				{{ uploading ? '加载中...' : '生成中...' }}
			</div>
		</div>
	</div>
</template>
