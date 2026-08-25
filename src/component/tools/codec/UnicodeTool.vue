<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { useDebounceFn } from '@/utils/debounce';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'to-unicode' | 'to-chinese'>('to-unicode');

	function process() {
		if (!input.value) {
			output.value = '';
			return;
		}
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
					<n-button :type="mode === 'to-unicode' ? 'primary' : 'default'" @click="mode = 'to-unicode'">
						中文 → Unicode
					</n-button>
					<n-button :type="mode === 'to-chinese' ? 'primary' : 'default'" @click="mode = 'to-chinese'">
						Unicode → 中文
					</n-button>
				</n-button-group>
			</div>
		</div>

		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">
					{{ mode === 'to-unicode' ? '中文文本' : 'Unicode 编码' }}
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
						<TkuIcon :name="icons.textFormat" :size="28" />
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

		<!-- About Unicode -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 Unicode 转义？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				Unicode 为世界上几乎所有的字符分配了唯一的编号（码点），用十六进制表示。在 JavaScript / JSON / HTML
				中，可以将字符写成
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">\uXXXX</code>
				形式的转义序列（4 位十六进制），例如中文字符「{{ '中' }}」的码点是
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">U+4E2D</code>，写成转义即
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u4E2D</code>。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				常见的 ASCII 范围转义：换行符对应
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u000A</code>，大写字母「A」对应
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u0041</code>。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				需要注意：Basic Multilingual Plane（BMP, U+0000 ~ U+FFFF）内的字符可以用 4 位「<code
					class="font-mono text-blue-700 bg-white/60 px-1 rounded"
					>\uXXXX</code
				>」表示。 BMP 之外的字符（如 emoji「{{ '😀' }}」）码点超过 4 位十六进制，需使用扩展写法
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">\u{XXXXX}</code>
				或「代理对」表示——本工具仅支持 BMP 内的字符。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				Unicode 转义常用于在代码、配置文件与网络协议中安全地传递特殊字符，避免字符集不兼容带来的乱码问题。
			</p>
		</div>
	</div>
</template>
