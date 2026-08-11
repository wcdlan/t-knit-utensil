<script lang="ts" setup>
	import { ref } from 'vue';
	import { NAlert, NButton, NInput } from 'naive-ui';

	const input = ref('');
	const output = ref('');
	const error = ref('');

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
			JSON.parse(input.value);
			error.value = '';
			output.value = '✓ JSON 格式正确';
		} catch (e) {
			error.value = '✗ JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function copy() {
		navigator.clipboard.writeText(output.value);
	}
</script>

<template>
	<div class="space-y-4">
		<n-input
			v-model:value="input"
			:autosize="{ minRows: 8 }"
			placeholder='粘贴 JSON 数据，例如: {"name": "test"}'
			type="textarea"
		/>

		<div class="flex flex-wrap gap-2">
			<n-button type="primary" @click="format"> 格式化 </n-button>
			<n-button type="info" @click="compress"> 压缩 </n-button>
			<n-button type="success" @click="validate"> 校验 </n-button>
		</div>

		<n-alert v-if="error" :type="error.startsWith('✓') ? 'success' : 'error'" class="text-sm">
			{{ error }}
		</n-alert>

		<div v-if="output && !error" class="relative">
			<n-input :autosize="{ minRows: 10 }" :value="output" readonly type="textarea" />
			<n-button class="absolute top-2 right-2" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
