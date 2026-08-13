<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInput, NInputNumber } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	const hex = ref('#3b82f6');
	const r = ref(59);
	const g = ref(130);
	const b = ref(246);
	const h = ref(0);
	const s = ref(0);
	const l = ref(0);
	const previewColor = ref('#3b82f6');

	function hexToRgb(hexVal: string) {
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

	function rgbToHsl(rv: number, gv: number, bv: number) {
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
			<!-- Preview swatch -->
			<div class="flex-shrink-0">
				<div
					:style="{ backgroundColor: previewColor }"
					class="w-36 h-36 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden"
				>
					<div class="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
				</div>
				<div class="mt-3 flex items-center gap-2">
					<div class="relative">
						<input v-model="hex" class="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" type="color" />
					</div>
					<span class="text-sm text-slate-500">取色</span>
				</div>
			</div>

			<!-- Value rows -->
			<div class="flex-1 space-y-4 w-full">
				<!-- HEX -->
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-2">HEX</label>
					<div class="flex gap-2">
						<n-input
							v-model:value="hex"
							class="flex-1 !font-mono"
							placeholder="#000000"
							@update:value="updateFromHex"
						/>
						<n-button secondary size="small" @click="copy(hex)">复制</n-button>
					</div>
				</div>

				<!-- RGB -->
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-2">RGB</label>
					<div class="flex flex-wrap items-center gap-2">
						<n-input-number
							v-model:value="r"
							:max="255"
							:min="0"
							class="!w-[80px] !font-mono"
							size="small"
							@update:value="updateFromRgb"
						/>
						<n-input-number
							v-model:value="g"
							:max="255"
							:min="0"
							class="!w-[80px] !font-mono"
							size="small"
							@update:value="updateFromRgb"
						/>
						<n-input-number
							v-model:value="b"
							:max="255"
							:min="0"
							class="!w-[80px] !font-mono"
							size="small"
							@update:value="updateFromRgb"
						/>
						<span
							class="text-xs text-slate-400 font-mono mx-1 cursor-pointer transition hover:text-blue-600"
							@click="copy(`rgb(${r}, ${g}, ${b})`)"
							>rgb({{ r }}, {{ g }}, {{ b }})</span
						>
						<n-button secondary size="small" @click="copy(`rgb(${r}, ${g}, ${b})`)">复制</n-button>
					</div>
				</div>

				<!-- HSL -->
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-2">HSL</label>
					<div class="flex flex-wrap items-center gap-2">
						<div
							class="px-3 py-1.5 bg-slate-50 rounded-lg text-sm font-mono text-slate-600 cursor-pointer transition hover:bg-blue-50/60"
							@click="copy(`hsl(${h}, ${s}%, ${l}%)`)"
						>
							hsl({{ h }}, {{ s }}%, {{ l }}%)
						</div>
						<n-button secondary size="small" @click="copy(`hsl(${h}, ${s}%, ${l}%)`)">复制</n-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
