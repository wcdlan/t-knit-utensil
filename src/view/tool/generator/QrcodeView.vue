<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import InputPanel from '@/fragment/tool/generator/qrcode/InputPanel.vue';
	import PreviewPanel from '@/fragment/tool/generator/qrcode/PreviewPanel.vue';
	import AboutPanel from '@/fragment/tool/generator/qrcode/AboutPanel.vue';

	const text = ref('');
	const size = ref(200);

	const qrUrl = computed(() => {
		if (!text.value) return '';
		return `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&data=${encodeURIComponent(text.value)}`;
	});
</script>

<template>
	<div class="space-y-6">
		<!-- InputPanel：二维码内容文本 + 尺寸设置输入区 -->
		<InputPanel v-model:size="size" v-model:text="text" />
		<!-- PreviewPanel：二维码实时预览图（含加载与大小提示） -->
		<PreviewPanel :qr-url="qrUrl" :size="size" :text="text" />
	</div>

	<!-- AboutPanel：工具简介与使用说明 -->
	<AboutPanel />
</template>
