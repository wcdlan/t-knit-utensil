<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';

	const input = ref('');
	const output = ref('');
	const mode = ref<'to-unicode' | 'to-chinese'>('to-unicode');

	function process() {
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

	function copy() {
		navigator.clipboard.writeText(output.value);
	}
</script>

<template>
	<div class="space-y-4">
		<n-button-group>
			<n-button :type="mode === 'to-unicode' ? 'primary' : 'default'" @click="mode = 'to-unicode'">
				中文 → Unicode
			</n-button>
			<n-button :type="mode === 'to-chinese' ? 'primary' : 'default'" @click="mode = 'to-chinese'">
				Unicode → 中文
			</n-button>
		</n-button-group>

		<n-input
			v-model:value="input"
			:autosize="{ minRows: 6 }"
			type="textarea"
			:placeholder="mode === 'to-unicode' ? '输入中文文本...' : '输入 Unicode 编码 (如 \\u4e2d\\u6587)...'"
		/>

		<n-button type="primary" @click="process"> 转换 </n-button>

		<div v-if="output" class="relative mt-2">
			<n-input :autosize="{ minRows: 6 }" :value="output" readonly type="textarea" />
			<n-button class="absolute top-2" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
