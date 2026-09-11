<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NButton, useMessage } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadBlob } from '@/utils/download';
	import {
		buildDataUri,
		extractMimeType,
		fileToDataUri,
		isValidBase64Content,
		stripBase64Prefix
	} from '@/utils/imageBase64';
	import type { ImageBase64Mode, ImageFileMeta } from '@/types/image';
	import ModeSelect from '@/fragment/tool/image/base64/ModeSelect.vue';
	import UploadArea from '@/fragment/tool/image/base64/UploadArea.vue';
	import Base64OutputPanel from '@/fragment/tool/image/base64/Base64OutputPanel.vue';
	import PreviewPanel from '@/fragment/tool/image/base64/PreviewPanel.vue';
	import Base64InputPanel from '@/fragment/tool/image/base64/Base64InputPanel.vue';
	import ImageOutputPanel from '@/fragment/tool/image/base64/ImageOutputPanel.vue';
	import AboutPanel from '@/fragment/tool/image/base64/AboutPanel.vue';

	const message = useMessage();

	// 操作方向
	const mode = ref<ImageBase64Mode>('image-to-base64');

	// 图片 -> Base64：完整带文件头的 Data URI（始终保存带头，展示/复制时按开关决定）
	const sourceDataUri = ref('');
	const sourceMeta = ref<ImageFileMeta | null>(null);
	const includeHeader = ref(true);

	// Base64 -> 图片
	const inputBase64 = ref('');
	const outputPreviewUri = ref('');
	const outputMeta = ref('');

	// 复制内容：按开关决定是否携带 data:image/xxx;base64, 头
	const copyContent = computed(() => {
		if (!sourceDataUri.value) return '';
		return includeHeader.value ? sourceDataUri.value : stripBase64Prefix(sourceDataUri.value);
	});

	async function onFileSelected(file: File) {
		try {
			sourceDataUri.value = await fileToDataUri(file);
			sourceMeta.value = { name: file.name, size: file.size, type: file.type };
		} catch {
			message.error('图片读取失败，请重试');
		}
	}

	function resetSource() {
		sourceDataUri.value = '';
		sourceMeta.value = null;
	}

	function copyBase64() {
		if (!copyContent.value) return;
		copyToClipboard(copyContent.value);
	}

	function convertToImage() {
		if (!isValidBase64Content(inputBase64.value)) {
			message.error('Base64 内容无效，请检查输入');
			outputPreviewUri.value = '';
			outputMeta.value = '';
			return;
		}
		const mime = extractMimeType(inputBase64.value) || 'image/png';
		const raw = stripBase64Prefix(inputBase64.value);
		outputPreviewUri.value = buildDataUri(raw, mime);
		outputMeta.value = mime.replace('image/', '').toUpperCase() + ' 图片';
	}

	function resetOutput() {
		inputBase64.value = '';
		outputPreviewUri.value = '';
		outputMeta.value = '';
	}

	function downloadOutput() {
		if (!outputPreviewUri.value) return;
		const mime = extractMimeType(outputPreviewUri.value) || 'image/png';
		const ext = (mime.split('/')[1] || 'png').replace('jpeg', 'jpg');
		const bytes = atob(stripBase64Prefix(outputPreviewUri.value));
		const u8 = new Uint8Array(bytes.length);
		for (let i = 0; i < bytes.length; i++) u8[i] = bytes.charCodeAt(i);
		downloadBlob(new Blob([u8], { type: mime }), `image.${ext}`);
	}

	function formatBytes(n: number): string {
		if (n < 1024) return n + ' B';
		if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
		return (n / (1024 * 1024)).toFixed(2) + ' MB';
	}
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col space-y-6">
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
		<!-- ModeSelect：图片转 Base64 / Base64 转图片 方向切换 -->
		<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />

		<!-- 图片转 Base64：上传图片生成 Base64 -->
		<template v-if="mode === 'image-to-base64'">
			<!-- UploadArea：点击 / 拖拽上传图片 -->
			<UploadArea v-if="!sourceDataUri" @file-selected="onFileSelected" />
			<div v-else class="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 items-stretch gap-4 lg:grid-cols-2 lg:grid-rows-1">
				<!-- PreviewPanel：上传原图预览 + 文件名 / 大小信息 -->
				<PreviewPanel
					:meta="sourceMeta ? sourceMeta.name + ' · ' + formatBytes(sourceMeta.size) : ''"
					:src="sourceDataUri"
				/>
				<!-- Base64OutputPanel：生成 Base64，含复制时是否携带文件头开关 -->
				<Base64OutputPanel
					:include-header="includeHeader"
					:value="copyContent"
					@copy="copyBase64"
					@reset="resetSource"
					@update:includeHeader="(v) => (includeHeader = v)"
				/>
			</div>
		</template>

		<!-- Base64 转图片：粘贴 Base64 + 转换成图片预览 -->
		<template v-else>
			<!-- Base64InputPanel：粘贴 Base64 -->
			<Base64InputPanel v-model:model-value="inputBase64" />
			<div class="flex items-center gap-3">
				<n-button :disabled="!inputBase64" type="primary" @click="convertToImage">转换为图片</n-button>
			</div>
			<!-- ImageOutputPanel：转换结果图片预览 + 下载按钮 -->
			<ImageOutputPanel
				:meta="outputMeta"
				:preview="outputPreviewUri"
				@download="downloadOutput"
				@reset="resetOutput"
			/>
		</template>
	</div>
</template>
