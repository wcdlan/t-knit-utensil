<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
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

	function copy() {
		navigator.clipboard.writeText(output.value);
	}
</script>

<template>
	<div class="space-y-4">
		<n-button-group>
			<n-button :type="mode === 'encode' ? 'primary' : 'default'" @click="mode = 'encode'"> 编码 (Encode) </n-button>
			<n-button :type="mode === 'decode' ? 'primary' : 'default'" @click="mode = 'decode'"> 解码 (Decode) </n-button>
		</n-button-group>

		<n-input
			v-model:value="input"
			:autosize="{ minRows: 6 }"
			:placeholder="mode === 'encode' ? '输入要编码的 URL 或文本...' : '输入 URL 编码的字符串...'"
			type="textarea"
		/>

		<n-button type="primary" @click="process"> 转换 </n-button>

		<div v-if="output" class="relative">
			<n-input :autosize="{ minRows: 6 }" :value="output" readonly type="textarea" />
			<n-button class="absolute top-2" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
