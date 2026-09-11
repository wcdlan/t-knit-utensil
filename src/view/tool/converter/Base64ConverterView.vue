<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import { downloadBlob, downloadTextFile } from '@/utils/download';
	import { decodeBase64, encodeBase64 } from '@/utils/base64';
	import { base64ToBlob, fileToBase64, restoreFromBase64 } from '@/utils/b64File';
	import type { B64FileMeta, B64FileOp, B64FileResult, B64RestoreInfo, B64Target, B64TextOp } from '@/types/base64';
	import AboutPanel from '@/fragment/tool/converter/base64-converter/AboutPanel.vue';
	import TargetSelect from '@/fragment/tool/converter/base64-converter/TargetSelect.vue';
	import TextModeSelect from '@/fragment/tool/converter/base64-converter/TextModeSelect.vue';
	import TextInputPanel from '@/fragment/tool/converter/base64-converter/TextInputPanel.vue';
	import TextOutputPanel from '@/fragment/tool/converter/base64-converter/TextOutputPanel.vue';
	import FileModeSelect from '@/fragment/tool/converter/base64-converter/FileModeSelect.vue';
	import FileUploadPanel from '@/fragment/tool/converter/base64-converter/FileUploadPanel.vue';
	import FileOutputPanel from '@/fragment/tool/converter/base64-converter/FileOutputPanel.vue';
	import Base64InputPanel from '@/fragment/tool/converter/base64-converter/Base64InputPanel.vue';
	import RestorePanel from '@/fragment/tool/converter/base64-converter/RestorePanel.vue';

	// ---- 顶层切换：文本 / 文件 ----
	const target = ref<B64Target>('text');

	// ---- 文本转换状态 ----
	const textOp = ref<B64TextOp>('encode');
	/** 编码模式示例（明文） */
	const TEXT_EXAMPLE = '你好，TKU 👋';
	/** 解码模式示例（明文的 Base64） */
	const B64_TEXT_EXAMPLE = encodeBase64(TEXT_EXAMPLE);
	const textInput = ref(TEXT_EXAMPLE);
	const textOutput = ref('');
	const textError = ref('');

	function processText() {
		if (!textInput.value) {
			textOutput.value = '';
			textError.value = '';
			return;
		}
		try {
			if (textOp.value === 'encode') {
				textOutput.value = encodeBase64(textInput.value);
			} else {
				textOutput.value = decodeBase64(textInput.value);
			}
			textError.value = '';
		} catch {
			textOutput.value = '';
			textError.value = '解码失败：输入不是合法的 Base64 内容';
		}
	}

	const debouncedProcessText = useDebounceFn(processText, 300);
	watch([textInput, textOp], debouncedProcessText);
	processText();

	// 切换编码 / 解码模式时，同步示例数据，避免默认明文切到解码后立即报错
	watch(textOp, (op) => {
		if (op === 'decode') {
			// 当前输入不是合法 Base64 时，替换为明文对应的 Base64 示例
			try {
				decodeBase64(textInput.value);
			} catch {
				textInput.value = B64_TEXT_EXAMPLE;
			}
		} else if (textInput.value === B64_TEXT_EXAMPLE) {
			// 从解码示例切回编码模式时，恢复明文示例
			textInput.value = TEXT_EXAMPLE;
		}
	});

	function swapText() {
		if (!textOutput.value) return;
		textInput.value = textOutput.value;
		textOp.value = textOp.value === 'encode' ? 'decode' : 'encode';
		processText();
	}

	function copyTextOutput() {
		if (!textOutput.value) return;
		copyToClipboard(textOutput.value);
	}

	// ---- 文件转 Base64 状态 ----
	const fileOp = ref<B64FileOp>('to-base64');
	const fileMeta = ref<B64FileMeta | null>(null);
	const fileResult = ref<B64FileResult | null>(null);
	const fileLoading = ref(false);
	const includeHeader = ref(true);

	async function onFileSelected(file: File) {
		fileLoading.value = true;
		try {
			fileMeta.value = { name: file.name, size: file.size, type: file.type };
			fileResult.value = await fileToBase64(file);
		} catch (e) {
			fileResult.value = null;
			fileMeta.value = null;
		} finally {
			fileLoading.value = false;
		}
	}

	function resetFileSource() {
		fileMeta.value = null;
		fileResult.value = null;
	}

	// ---- Base64 还原文件状态 ----
	const restoreInput = ref('');
	const restoreInfo = ref<B64RestoreInfo | null>(null);
	const restoreError = ref('');
	const previewUrl = ref('');
	const previewText = ref('');
	const restoreBlob = ref<Blob | null>(null);

	/** 还原建议文件名：未知名时用 base64.bin，否则 mime 映射扩展名 */
	const restoreFileName = computed(() => {
		if (!restoreInfo.value) return '';
		return 'restored.' + restoreInfo.value.extension;
	});

	function processRestore() {
		// 释放上一轮的预览 URL，避免内存泄漏
		if (previewUrl.value) {
			URL.revokeObjectURL(previewUrl.value);
			previewUrl.value = '';
		}
		previewText.value = '';
		restoreBlob.value = null;
		if (!restoreInput.value.trim()) {
			restoreInfo.value = null;
			restoreError.value = '';
			return;
		}
		try {
			restoreInfo.value = restoreFromBase64(restoreInput.value);
			restoreError.value = '';
			const blob = base64ToBlob(restoreInput.value, restoreInfo.value.mime);
			restoreBlob.value = blob;
			// 文本 / JSON 类：读为 UTF-8 文本预览；其余（图片 / PDF 等）：用对象 URL 预览
			const isText =
				restoreInfo.value.mime.startsWith('text/') ||
				['application/json', 'application/xml', 'application/javascript'].includes(restoreInfo.value.mime);
			if (isText) {
				loadPreviewText(blob);
			} else {
				previewUrl.value = URL.createObjectURL(blob);
			}
		} catch (e) {
			restoreInfo.value = null;
			restoreError.value = (e as Error).message;
		}
	}

	/** 异步读取 Blob 内容用于文本预览 */
	async function loadPreviewText(blob: Blob) {
		previewText.value = await blob.text();
	}

	const debouncedRestore = useDebounceFn(processRestore, 300);
	watch(restoreInput, debouncedRestore);
	processRestore();

	function copyRestoreInput() {
		if (!restoreInput.value) return;
		copyToClipboard(restoreInput.value);
	}

	function downloadRestored() {
		if (!restoreBlob.value || !restoreInfo.value) return;
		downloadBlob(restoreBlob.value, restoreFileName.value);
	}

	function resetRestore() {
		restoreInput.value = '';
		restoreInfo.value = null;
		restoreError.value = '';
		previewText.value = '';
		if (previewUrl.value) {
			URL.revokeObjectURL(previewUrl.value);
			previewUrl.value = '';
		}
		restoreBlob.value = null;
	}

	function downloadFileBase64() {
		if (!fileResult.value) return;
		const content = includeHeader.value ? fileResult.value.dataUri : fileResult.value.raw;
		const base = (fileMeta.value?.name ?? 'file').replace(/\.[^.]+$/, '');
		downloadTextFile(content, base + '.txt');
	}

	function copyFileBase64() {
		if (!fileResult.value) return;
		copyToClipboard(includeHeader.value ? fileResult.value.dataUri : fileResult.value.raw);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
		<!-- TargetSelect：转换对象切换（文本 / 文件） -->
		<TargetSelect :target="target" @update:target="(v) => (target = v)" />

		<!-- ===== 文本转换 ===== -->
		<template v-if="target === 'text'">
			<!-- TextModeSelect：编码 / 解码 方向切换 -->
			<TextModeSelect :op="textOp" @update:op="(v) => (textOp = v)" />
			<!-- TextInputPanel：原始文本 / Base64 输入框（输入即出结果） -->
			<TextInputPanel v-model:model-value="textInput" :op="textOp" />
			<!-- TextOutputPanel：转换结果输出（互换方向 / 复制） -->
			<TextOutputPanel :error="textError" :output="textOutput" @copy="copyTextOutput" @swap="swapText" />
		</template>

		<!-- ===== 文件转换 ===== -->
		<template v-else>
			<!-- FileModeSelect：文件转 Base64 / Base64 还原文件 方向切换 -->
			<FileModeSelect :op="fileOp" @update:op="(v) => (fileOp = v)" />

			<!-- 文件转 Base64：选择文件生成 Base64 -->
			<template v-if="fileOp === 'to-base64'">
				<!-- FileUploadPanel：点击 / 拖拽选择任意文件 -->
				<FileUploadPanel
					:loading="fileLoading"
					:meta="fileMeta"
					@reset="resetFileSource"
					@file-selected="onFileSelected"
				/>
				<!-- FileOutputPanel：Base64 结果输出（Data URI 头开关 / 复制 / 下载） -->
				<FileOutputPanel
					v-model:include-header="includeHeader"
					:loading="fileLoading"
					:result="fileResult"
					@copy="copyFileBase64"
					@download="downloadFileBase64"
				/>
			</template>

			<!-- Base64 还原文件：粘贴 Base64 或上传 txt 自动识别还原 -->
			<template v-else>
				<!-- Base64InputPanel：Base64 输入（支持粘贴，或上传 txt 文件加载，加载态仅显示摘要） -->
				<Base64InputPanel v-model:model-value="restoreInput" />
				<!-- RestorePanel：还原信息 / 预览 / 下载还原文件 -->
				<RestorePanel
					:error="restoreError"
					:file-name="restoreFileName"
					:info="restoreInfo"
					:preview-text="previewText"
					:preview-url="previewUrl"
					@copy="copyRestoreInput"
					@download="downloadRestored"
					@reset="resetRestore"
				/>
			</template>
		</template>
	</div>
</template>
