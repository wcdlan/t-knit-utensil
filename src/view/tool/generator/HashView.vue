<script lang="ts" setup>
	import { ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import AlgorithmSelect from '@/fragment/tool/generator/hash/AlgorithmSelect.vue';
	import InputPanel from '@/fragment/tool/generator/hash/InputPanel.vue';
	import ActionBar from '@/fragment/tool/generator/hash/ActionBar.vue';
	import OutputPanel from '@/fragment/tool/generator/hash/OutputPanel.vue';
	import AboutPanel from '@/fragment/tool/generator/hash/AboutPanel.vue';
	import type { HashAlgorithm } from '@/types/hash';

	const input = ref('');
	const algorithm = ref<HashAlgorithm>('MD5');
	const output = ref('');

	async function generateHash() {
		if (!input.value) return;
		const msgUint8 = new TextEncoder().encode(input.value);
		const hashBuffer = await crypto.subtle.digest(algorithm.value, msgUint8);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		output.value = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	function copy() {
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AlgorithmSelect：哈希算法选择下拉框（MD5 / SHA-1 / SHA-256 / SHA-512 等） -->
		<AlgorithmSelect v-model:model-value="algorithm" />
		<!-- InputPanel：待哈希的文本输入框 -->
		<InputPanel v-model:model-value="input" />
		<!-- ActionBar：计算哈希操作按钮 -->
		<ActionBar @process="generateHash" />
		<!-- OutputPanel：哈希结果输出区（展示当前算法与摘要，可复制） -->
		<OutputPanel :algorithm="algorithm" :output="output" @copy="copy" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
