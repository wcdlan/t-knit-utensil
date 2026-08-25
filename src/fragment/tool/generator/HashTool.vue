<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput, NSelect } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

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
			<div class="relative">
				<n-input
					v-model:value="input"
					:autosize="{ minRows: 5, maxRows: 12 }"
					placeholder="输入要计算哈希的文本..."
					type="textarea"
				/>
				<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
				<div
					v-if="!input"
					class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
				>
					<div class="mb-2 text-slate-300">
						<TkuIcon :name="icons.shieldLock" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">输入文本后点击「计算哈希」生成结果</p>
				</div>
			</div>
		</div>

		<!-- Action button -->
		<n-button type="primary" @click="generateHash">计算哈希</n-button>

		<!-- Output section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">哈希结果 ({{ algorithm }})</label>
				<n-button :disabled="!output" secondary size="tiny" @click="copy">复制</n-button>
			</div>
			<div
				class="p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer transition hover:bg-slate-100"
				@click="copy"
			>
				<code v-if="output" class="text-sm font-mono text-slate-700 break-all leading-relaxed">{{ output }}</code>
				<span v-else class="text-sm text-slate-400">输入文本后点击「计算哈希」生成结果</span>
			</div>
		</div>

		<!-- About hash -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是哈希？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				哈希算法将任意长度的输入映射为固定长度的十六进制摘要（MD5 为 32 位、SHA-256 为 64
				位）。只要输入稍有不同，输出就会面目全非，且过程不可逆。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				MD5 与 SHA-1 存在已知碰撞漏洞，不再适合安全场景；SHA-256/384/512 （属于 SHA-2
				家族）至今仍被广泛用于文件校验与数据处理。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：校验下载文件完整性（对比哈希值）、判断两段内容是否一致、以及为密码存储加盐。本工具在浏览器端本地计算，内容不会上传——但请注意，只有哈希是<span
					class="font-medium text-blue-800"
					>不可逆的指纹</span
				>，请勿用它加密敏感信息。
			</p>
		</div>
	</div>
</template>
