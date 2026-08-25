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
		<GenToolbar v-model:gen-mode="genMode" :gen-mode-options="genModeOptions" @generate="generateRandom" />

		<!-- Editor area: left input / buttons center / right output -->
		<div class="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
			<InputPanel v-model:model-value="input" />
			<ActionBar @compress="compress" @format="format" @validate="validate" />
			<OutputPanel :output="output" @copy="copyOutput" />
		</div>

		<FeedbackAlert v-if="error" :message="alertMessage()" :type="alertType()" />

		<AboutPanel />
	</div>
</template>
