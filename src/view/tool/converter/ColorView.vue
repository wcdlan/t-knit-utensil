<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { HslChannels, RgbChannels } from '@/types/color';
	import ColorPreview from '@/fragment/tool/converter/color/ColorPreview.vue';
	import HexInput from '@/fragment/tool/converter/color/HexInput.vue';
	import RgbHslPanel from '@/fragment/tool/converter/color/RgbHslPanel.vue';
	import AboutPanel from '@/fragment/tool/converter/color/AboutPanel.vue';

	const hex = ref('#3b82f6');
	const r = ref<number | null>(59);
	const g = ref<number | null>(130);
	const b = ref<number | null>(246);
	const h = ref(0);
	const s = ref(0);
	const l = ref(0);
	const previewColor = ref('#3b82f6');

	function hexToRgb(hexVal: string): RgbChannels | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexVal);
		if (!result) return null;
		return {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		};
	}

	function rgbToHex(rv: number, gv: number, bv: number) {
		return '#' + [rv, gv, bv].map((x) => x.toString(16).padStart(2, '0')).join('');
	}

	function rgbToHsl(rv: number, gv: number, bv: number): HslChannels {
		rv /= 255;
		gv /= 255;
		bv /= 255;
		const max = Math.max(rv, gv, bv),
			min = Math.min(rv, gv, bv);
		let hv = 0,
			sv = 0;
		const lv = (max + min) / 2;
		if (max !== min) {
			const d = max - min;
			sv = lv > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case rv:
					hv = ((gv - bv) / d + (gv < bv ? 6 : 0)) / 6;
					break;
				case gv:
					hv = ((bv - rv) / d + 2) / 6;
					break;
				case bv:
					hv = ((rv - gv) / d + 4) / 6;
					break;
			}
		}
		return { h: Math.round(hv * 360), s: Math.round(sv * 100), l: Math.round(lv * 100) };
	}

	function updateFromHex() {
		const rgb = hexToRgb(hex.value);
		if (rgb) {
			r.value = rgb.r;
			g.value = rgb.g;
			b.value = rgb.b;
			const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
			h.value = hsl.h;
			s.value = hsl.s;
			l.value = hsl.l;
			previewColor.value = hex.value.startsWith('#') ? hex.value : '#' + hex.value;
		}
	}

	function updateFromRgb() {
		if (r.value == null || g.value == null || b.value == null) return;
		hex.value = rgbToHex(r.value, g.value, b.value);
		const hsl = rgbToHsl(r.value, g.value, b.value);
		h.value = hsl.h;
		s.value = hsl.s;
		l.value = hsl.l;
		previewColor.value = hex.value;
	}

	function copy(val: string) {
		copyToClipboard(val);
	}

	watch(hex, updateFromHex);
	updateFromHex();
</script>

<template>
	<div class="space-y-8">
		<!-- Color Preview Card -->
		<div class="flex flex-col sm:flex-row gap-6 items-start">
			<ColorPreview :hex="hex" :preview-color="previewColor" @update:hex="(v) => (hex = v)" />

			<!-- Value rows -->
			<div class="flex-1 space-y-4 w-full">
				<HexInput
					:hex="hex"
					@copy="copy"
					@update:hex="
						(v) => {
							hex = v;
							updateFromHex();
						}
					"
				/>
				<RgbHslPanel
					:b="b"
					:g="g"
					:h="h"
					:l="l"
					:r="r"
					:s="s"
					@copy="copy"
					@update:r="
						(v) => {
							r = v;
							updateFromRgb();
						}
					"
					@update:g="
						(v) => {
							g = v;
							updateFromRgb();
						}
					"
					@update:b="
						(v) => {
							b = v;
							updateFromRgb();
						}
					"
				/>
			</div>
		</div>

		<!-- About color models -->
		<AboutPanel />
	</div>
</template>
