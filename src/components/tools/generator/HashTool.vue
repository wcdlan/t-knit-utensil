<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput, NSelect } from 'naive-ui';

	const input = ref('');
	const algorithm = ref('MD5');
	const output = ref('');

	const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

	const algoOptions = algorithms.map((a) => ({ label: a, value: a }));

	async function generateHash() {
		if (!input.value) return;
		const msgUint8 = new TextEncoder().encode(input.value);
		const hashBuffer = await crypto.subtle.digest(algorithm.value, msgUint8);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		output.value = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	function copy() {
		navigator.clipboard.writeText(output.value);
	}
</script>

<template>
	<div class="space-y-4">
		<n-select v-model:value="algorithm" :options="algoOptions" class="max-w-[200px]" />

		<n-input v-model:value="input" :autosize="{ minRows: 5 }" placeholder="输入要计算哈希的文本..." type="textarea" />

		<n-button type="primary" @click="generateHash"> 计算 </n-button>

		<div v-if="output" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
			<code class="text-sm font-mono text-gray-700 break-all">{{ output }}</code>
			<n-button class="ml-3 flex-shrink-0" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
