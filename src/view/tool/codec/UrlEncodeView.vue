<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import ModeSelect from '@/fragment/tool/codec/url-encode/ModeSelect.vue';
	import InputPanel from '@/fragment/tool/codec/url-encode/InputPanel.vue';
	import OutputPanel from '@/fragment/tool/codec/url-encode/OutputPanel.vue';
	import ActionBar from '@/fragment/tool/codec/url-encode/ActionBar.vue';
	import AboutPanel from '@/fragment/tool/codec/url-encode/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
		try {
			if (mode.value === 'encode') {
				output.value = encodeURIComponent(input.value);
			} else {
				output.value = decodeURIComponent(input.value);
			}
		} catch {
			output.value = '转换失败，请检查输入内容';
		}
	}

	const debouncedProcess = useDebounceFn(process, 500);
	watch([input, mode], debouncedProcess);

	function copy() {
		if (!output.value) return;
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- ModeSelect：URL 编码 / 解码 操作模式切换 -->
		<ModeSelect :mode="mode" @update:mode="(v) => (mode = v)" />
		<!-- InputPanel：待转换文本输入框 -->
		<InputPanel v-model:model-value="input" :mode="mode" />
		<!-- ActionBar：转换操作按钮 -->
		<ActionBar @process="process" />
		<!-- OutputPanel：转换结果输出区（只读 + 复制按钮） -->
		<OutputPanel :output="output" @copy="copy" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
