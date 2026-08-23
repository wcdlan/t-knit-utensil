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

		<!-- About color models -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">关于颜色模型</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				<span class="font-medium text-blue-800">HEX</span>（十六进制颜色）是 Web 开发中最常用的颜色表示法，以
				<code class="font-mono text-xs text-blue-800">#RRGGBB</code>
				格式书写，每两位十六进制数分别代表红、绿、蓝通道的亮度（00～FF，即 0～255）。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				<span class="font-medium text-blue-800">RGB</span>（红绿蓝）与 HEX
				本质相同——都是面向显示设备的加色模型。三个数值分别表示红、绿、蓝通道的强度，数值越大颜色越亮； 三通道全为 0
				时为黑色，全为 255 时为白色。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				<span class="font-medium text-blue-800">HSL</span>（色相、饱和度、明度）更贴近人类对颜色的认知：
				色相（H）在色环上以角度（0°～360°）定义色调；饱和度（S）控制色彩的鲜艳程度（0% 为灰色，100% 为纯色）；
				明度（L）控制色彩的明暗（0% 为黑色，100% 为白色）。HSL 在需要微调颜色倾向时比 RGB 更直观。
			</p>
		</div>
	</div>
</template>
