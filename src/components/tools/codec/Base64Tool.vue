<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { useDebounceFn } from '@/utils/debounce';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

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
				output.value = btoa(unescape(encodeURIComponent(input.value)));
			} else {
				output.value = decodeURIComponent(escape(atob(input.value)));
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

	function swap() {
		input.value = output.value;
		mode.value = mode.value === 'encode' ? 'decode' : 'encode';
		process();
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Mode selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex items-center gap-3">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">操作模式</span>
				<n-button-group>
					<n-button :type="mode === 'encode' ? 'primary' : 'default'" @click="mode = 'encode'"> 编码 </n-button>
					<n-button :type="mode === 'decode' ? 'primary' : 'default'" @click="mode = 'decode'"> 解码 </n-button>
				</n-button-group>
			</div>
		</div>

		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">
					{{ mode === 'encode' ? '原始文本' : '已编码文本' }}
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
						<TkuIcon :name="icons.pencil" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">输入文本，结果将自动更新</p>
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex items-center gap-3">
			<n-button type="primary" @click="process">
				<span class="flex items-center gap-1.5">
					<span>转换</span>
					<span class="text-xs opacity-60">&rarr;</span>
				</span>
			</n-button>
			<n-button v-if="output" secondary @click="swap">
				<span class="flex items-center gap-1.5">
					<span>&#8596;</span>
					<span>交换</span>
				</span>
			</n-button>
		</div>

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

		<!-- About Base64 -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 Base64？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				Base64 使用
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">A-Z a-z 0-9 + /</code>
				共 64 个可打印字符来表示二进制数据。每 3 个字节会被编码为 4 个字符，因此编码后的体积约为原始数据的
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">4/3</code>。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				例如中文「{{ '中' }}」按 UTF-8 编码为字节序列后，对应 Base64 为
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">5Lit</code>。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				它常用于在文本协议中安全传输图片、文件、证书等二进制内容（如 Data URI、邮件附件、JSON 字段），URL 场景下可使用
				URL-safe 变体（以
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">-</code>
				和
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">_</code>
				替代
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">+</code>
				和
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">/</code>）。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				请注意：Base64 是<span class="font-medium text-blue-800">编码</span
				>，不是加密，任何人都可以解码得到原文，请勿用它保护敏感信息。
			</p>
		</div>
	</div>
</template>
