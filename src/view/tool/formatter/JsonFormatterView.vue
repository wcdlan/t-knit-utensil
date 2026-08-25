<script lang="ts" setup>
	import { ref } from 'vue';
	import { generateRandomJson } from '@/utils/jsonGenerator';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { JsonGenMode } from '@/types/json';
	import GenToolbar from '@/fragment/tool/formatter/json-formatter/GenToolbar.vue';
	import InputPanel from '@/fragment/tool/formatter/json-formatter/InputPanel.vue';
	import ActionBar from '@/fragment/tool/formatter/json-formatter/ActionBar.vue';
	import OutputPanel from '@/fragment/tool/formatter/json-formatter/OutputPanel.vue';
	import FeedbackAlert from '@/fragment/tool/formatter/json-formatter/FeedbackAlert.vue';
	import AboutPanel from '@/fragment/tool/formatter/json-formatter/AboutPanel.vue';

	const input = ref('');
	const output = ref('');
	const error = ref('');

	const OK_PREFIX = '[OK]';
	const ERR_PREFIX = '[ERR]';

	// ---- 随机 JSON 生成 ----
	const genMode = ref<JsonGenMode>('rich');
	const genModeOptions = [
		{ label: '全格式（丰富）', value: 'rich' },
		{ label: '基础对象', value: 'basic' },
		{ label: '精简', value: 'compact' },
		{ label: '数组集合', value: 'array' },
		{ label: '深层嵌套', value: 'deep' }
	];

	function generateRandom() {
		error.value = '';
		const json = generateRandomJson(genMode.value, true);
		input.value = json;
		output.value = '';
	}

	function format() {
		try {
			error.value = '';
			output.value = JSON.stringify(JSON.parse(input.value), null, 2);
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function compress() {
		try {
			error.value = '';
			output.value = JSON.stringify(JSON.parse(input.value));
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function validate() {
		try {
			// 校验通过后自动格式化为输出结果
			output.value = JSON.stringify(JSON.parse(input.value), null, 2);
			error.value = OK_PREFIX + ' JSON 格式正确，已自动格式化';
		} catch (e) {
			error.value = ERR_PREFIX + ' JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function copyOutput() {
		copyToClipboard(output.value);
	}

	const alertMessage = () => error.value.replace(OK_PREFIX + ' ', '').replace(ERR_PREFIX + ' ', '');
	const alertType = () => (error.value.startsWith(OK_PREFIX) ? 'success' : 'error');
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col space-y-6">
		<!-- GenToolbar：随机 JSON 生成工具栏（生成模式选择 + 一键生成） -->
		<GenToolbar v-model:gen-mode="genMode" :gen-mode-options="genModeOptions" @generate="generateRandom" />

		<!-- 编辑区：左侧输入 / 中间按钮 / 右侧输出 -->
		<div class="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
			<!-- InputPanel：JSON 输入编辑器 -->
			<InputPanel v-model:model-value="input" />
			<!-- ActionBar：格式化 / 压缩 / 校验 操作按钮 -->
			<ActionBar @compress="compress" @format="format" @validate="validate" />
			<!-- OutputPanel：格式化 / 压缩结果输出区（只读 + 复制按钮） -->
			<OutputPanel :output="output" @copy="copyOutput" />
		</div>

		<!-- FeedbackAlert：校验 / 格式化结果的反馈提示条（成功或错误信息） -->
		<FeedbackAlert v-if="error" :message="alertMessage()" :type="alertType()" />

		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
