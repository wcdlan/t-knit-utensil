<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput, NSelect } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

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
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Algorithm selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex items-center gap-3">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">哈希算法</span>
				<n-select v-model:value="algorithm" :options="algoOptions" class="!w-[180px] !max-w-full" />
			</div>
		</div>

		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输入文本</label>
				<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
			</div>
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 5, maxRows: 12 }"
				placeholder="输入要计算哈希的文本..."
				type="textarea"
			/>
		</div>

		<!-- Action button -->
		<n-button type="primary" @click="generateHash">计算哈希</n-button>

		<!-- Output section -->
		<div v-if="output">
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">哈希结果 ({{ algorithm }})</label>
				<n-button secondary size="tiny" @click="copy">复制</n-button>
			</div>
			<div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
				<code class="text-sm font-mono text-slate-700 break-all leading-relaxed">{{ output }}</code>
			</div>
		</div>

		<!-- Empty state -->
		<div v-if="!input && !output" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 text-slate-300">
				<TkuIcon :name="icons.shieldLock" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">输入文本后点击「计算哈希」生成结果</p>
		</div>
	</div>
</template>
