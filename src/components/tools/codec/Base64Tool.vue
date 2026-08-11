<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
		try {
			if (mode.value === 'encode') {
				output.value = btoa(unescape(encodeURIComponent(input.value)));
			} else {
				output.value = decodeURIComponent(escape(atob(input.value)));
			}
		} catch {
			output.value = '转换失败，请检查输入内容';
		}
	}

	function copy() {
		navigator.clipboard.writeText(output.value);
	}

	function swap() {
		input.value = output.value;
		mode.value = mode.value === 'encode' ? 'decode' : 'encode';
		output.value = '';
	}
</script>

<template>
	<div class="space-y-4">
		<n-button-group>
			<n-button :type="mode === 'encode' ? 'primary' : 'default'" @click="mode = 'encode'"> 编码 </n-button>
			<n-button :type="mode === 'decode' ? 'primary' : 'default'" @click="mode = 'decode'"> 解码 </n-button>
		</n-button-group>

		<n-input
			v-model:value="input"
			:autosize="{ minRows: 6 }"
			:placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'"
			type="textarea"
		/>

		<div class="flex gap-2">
			<n-button type="primary" @click="process"> 转换 </n-button>
			<n-button v-if="output" @click="swap"> 交换 </n-button>
		</div>

		<div v-if="output" class="relative">
			<n-input :autosize="{ minRows: 6 }" :value="output" readonly type="textarea" />
			<n-button class="absolute top-2" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
