<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useDebounceFn } from '@/utils/debounce';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { UnicodeMode } from '@/types/unicode';
	import ModeSelect from '@/fragment/tool/codec/unicode/ModeSelect.vue';
	import InputPanel from '@/fragment/tool/codec/unicode/InputPanel.vue';
	import OutputPanel from '@/fragment/tool/codec/unicode/OutputPanel.vue';
	import ActionBar from '@/fragment/tool/codec/unicode/ActionBar.vue';
	import AboutPanel from '@/fragment/tool/codec/unicode/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<UnicodeMode>('to-unicode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
		try {
			if (mode.value === 'to-unicode') {
				output.value = input.value
					.split('')
					.map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
					.join('');
			} else {
				output.value = input.value.replace(/\\u[\da-f]{4}/gi, (match) =>
					String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
				);
			}
		} catch {
			output.value = '转换失败';
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
		<!-- ModeSelect：文本转 Unicode / Unicode 转文本 模式切换 -->
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
