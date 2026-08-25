<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NInput, NSelect } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const text = ref('');
	const size = ref(200);

	const sizeOptions = [
		{ label: '150 x 150', value: 150 },
		{ label: '200 x 200', value: 200 },
		{ label: '300 x 300', value: 300 },
		{ label: '400 x 400', value: 400 }
	];

	const qrUrl = computed(() => {
		if (!text.value) return '';
		return `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&data=${encodeURIComponent(text.value)}`;
	});
</script>

<template>
	<div class="space-y-6">
		<!-- Input section -->
		<div class="p-5 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex flex-col sm:flex-row gap-4 items-end">
				<div class="flex-1 w-full">
					<label class="block text-xs font-semibold text-slate-500 mb-2">内容</label>
					<n-input
						v-model:value="text"
						:autosize="{ minRows: 3, maxRows: 6 }"
						placeholder="输入文本或网址..."
						type="textarea"
					/>
				</div>
				<div class="w-full sm:w-auto">
					<label class="block text-xs font-semibold text-slate-500 mb-2">尺寸</label>
					<n-select v-model:value="size" :options="sizeOptions" class="!w-[140px] !max-w-full" />
				</div>
			</div>
		</div>

		<!-- Preview section -->
		<div class="flex flex-col items-center">
			<div v-if="qrUrl" class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
				<img :alt="text" :height="size" :src="qrUrl" :width="size" class="block rounded-lg" />
			</div>
			<div v-else class="flex flex-col items-center justify-center py-16 text-center w-full">
				<div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
					<span class="text-slate-300">
						<TkuIcon :name="icons.qrcode" :size="32" />
					</span>
				</div>
				<p class="text-slate-400 text-sm">输入内容后自动生成二维码</p>
				<p class="text-slate-300 text-xs mt-1">支持文本、网址等内容</p>
			</div>
		</div>
	</div>

	<!-- About QR code -->
	<div>
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是二维码？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				二维码（Quick Response Code）是日本电装于 1994 年发明的矩阵式二维条码，用黑白方块排列记录数据。
				相比传统一维条码，二维码可存储更多信息（字母数字模式下最多 4296
				个字符），且支持纠错——即使部分污损也能被正常识别。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				每个二维码的角落有三个定位图案（回形方块），帮助扫码设备快速定位方向； 内部的数据区域通过 RS-Reed Solomon
				纠错码保证可靠性，共分为 L、M、Q、H 四个纠错等级（分别可恢复约 7%、15%、25%、30% 的数据）。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				常见应用场景：网址分享、Wi-Fi
				配置、名片交换（vCard）、支付凭证、活动票务等。手机自带相机即可扫描，无需额外安装应用。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				本工具通过调用外部 API（<code class="font-mono text-xs text-blue-800">qrserver.com</code>）生成二维码图片，
				输入的文本/网址将被发送至该服务处理。请勿将敏感信息（如密码、私钥）写入二维码内容。
			</p>
		</div>
	</div>
</template>
