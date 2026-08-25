<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { useDebounceFn } from '@/utils/debounce';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
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

	const debouncedProcess = useDebounceFn(process, 500);
	watch([input, mode], debouncedProcess);

	function copy() {
		if (!output.value) return;
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Mode selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex items-center gap-3">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">操作模式</span>
				<n-button-group>
					<n-button :type="mode === 'encode' ? 'primary' : 'default'" @click="mode = 'encode'">
						编码 (Encode)
					</n-button>
					<n-button :type="mode === 'decode' ? 'primary' : 'default'" @click="mode = 'decode'">
						解码 (Decode)
					</n-button>
				</n-button-group>
			</div>
		</div>

		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">
					{{ mode === 'encode' ? '原始 URL 或文本' : '已编码字符串' }}
				</label>
				<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
			</div>
			<div class="relative">
				<n-input v-model:value="input" :autosize="{ minRows: 6, maxRows: 16 }" type="textarea" />
				<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
				<div
					v-if="!input"
					class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
				>
					<div class="mb-2 text-slate-300">
						<TkuIcon :name="icons.link" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">输入文本，结果将自动更新</p>
				</div>
			</div>
		</div>

		<!-- Action button -->
		<n-button type="primary" @click="process">
			<span class="flex items-center gap-1.5">
				<span>转换</span>
				<span class="text-xs opacity-60">&rarr;</span>
			</span>
		</n-button>

		<!-- Output section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button :disabled="!output" secondary size="tiny" @click="copy">复制</n-button>
				</div>
			</div>
			<div class="relative">
				<n-input
					:autosize="{ minRows: 6, maxRows: 16 }"
					:value="output"
					class="cursor-pointer"
					readonly
					type="textarea"
					@click="copy"
				/>
				<!-- 无结果占位层 -->
				<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<span class="text-slate-300 text-xs">结果将自动显示在这里</span>
				</div>
			</div>
		</div>

		<!-- About URL encoding -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 URL 编码？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				URL 只允许使用 ASCII 字符集中的一部分安全字符。中文、空格、<code
					class="font-mono text-blue-700 bg-white/60 px-1 rounded"
					>&amp;</code
				>、<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">=</code>
				等其它字符需要被「百分号编码」，规则是将字符按 UTF-8 编码成字节，每个字节写成
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">%XX</code>
				的形式。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				例如中文「{{ '你' }}」编码后为
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">%E4%BD%A0</code>，空格对应
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">%20</code>（表单提交时也写作
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">+</code>）。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				JavaScript 提供两个常用的编码函数：<code class="font-mono text-blue-700 bg-white/60 px-1 rounded"
					>encodeURIComponent</code
				>
				会对包括
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">/ : ? &amp; =</code>
				在内的保留字符一并编码，适合编码 URL 的查询参数值；<code
					class="font-mono text-blue-700 bg-white/60 px-1 rounded"
					>encodeURI</code
				>
				会保留这些字符，适合编码整个 URL。本工具使用的是前者（<code
					class="font-mono text-blue-700 bg-white/60 px-1 rounded"
					>encodeURIComponent</code
				>）。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：构建带中文或特殊字符的链接、传递查询参数、以及爬虫与接口调试中还原被编码的日志参数。
			</p>
		</div>
	</div>
</template>
