<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInput, NSelect } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { convertEncoding, SUPPORTED_ENCODINGS } from '@/utils/encoding';
	import { useDebounceFn } from '@/utils/debounce';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const sourceEncoding = ref('utf8');
	const results = ref<{ encoding: string; label: string; text: string }[]>([]);

	function process() {
		if (!input.value.trim()) {
			results.value = [];
			return;
		}
		results.value = SUPPORTED_ENCODINGS.map((enc) => {
			try {
				return {
					encoding: enc.value,
					label: enc.label,
					text: convertEncoding(input.value, sourceEncoding.value, enc.value)
				};
			} catch {
				return {
					encoding: enc.value,
					label: enc.label,
					text: '转换失败'
				};
			}
		});
	}

	const debouncedProcess = useDebounceFn(process, 500);
	watch([input, sourceEncoding], debouncedProcess);

	function copyResult(text: string) {
		copyToClipboard(text);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Encoding selector -->
		<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex items-center gap-3 flex-wrap">
				<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">输入编码</span>
				<n-select
					v-model:value="sourceEncoding"
					:options="SUPPORTED_ENCODINGS"
					class="!w-[190px] !max-w-full"
					placeholder="选择输入文本的原始编码"
					size="small"
				/>
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
					:autosize="{ minRows: 6, maxRows: 16 }"
					placeholder="输入要测试的文本，结果将自动更新..."
					type="textarea"
				/>
				<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
				<div
					v-if="!input"
					class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
				>
					<div class="mb-2 text-slate-300">
						<TkuIcon :name="icons.textFormat" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">输入文本即可自动查看所有编码下的显示效果</p>
				</div>
			</div>
		</div>

		<!-- Results grid -->
		<div>
			<div class="flex items-center gap-2 mb-3">
				<label class="text-xs font-semibold text-slate-500">转换结果</label>
				<span v-if="results.length" class="text-[10px] text-slate-400">共 {{ results.length }} 种编码</span>
			</div>
			<div v-if="results.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				<div
					v-for="result in results"
					:key="result.encoding"
					class="bg-slate-50/80 rounded-lg border border-slate-100 p-3 space-y-2"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1.5">
							<span class="text-xs font-semibold text-slate-700">{{ result.label }}</span>
							<span
								v-if="result.encoding === sourceEncoding"
								class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium"
							>
								原始
							</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="text-[10px] text-slate-400">{{ result.text.length }} 字符</span>
							<n-button secondary size="tiny" @click="copyResult(result.text)">复制</n-button>
						</div>
					</div>
					<div
						class="text-sm font-mono text-slate-600 bg-white rounded border border-slate-100 p-2 min-h-[2rem] max-h-[6rem] overflow-y-auto whitespace-pre-wrap break-all cursor-pointer transition hover:bg-blue-50/40"
						@click="copyResult(result.text)"
					>
						{{ result.text || '(空)' }}
					</div>
				</div>
			</div>
			<div v-else class="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
				<span class="text-slate-300 text-sm">输入文本后自动展示所有编码下的转换结果</span>
			</div>
		</div>

		<!-- About encoding conversion -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是编码转换？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				同一段字节序列，用不同的字符集去解读，会得到完全不同的文字。例如中文「{{ '中' }}」按 UTF-8 编码为字节
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">E4 B8 AD</code>；若误用 GBK 去解码，就会显示成
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">涓</code>——这就是常见的「乱码」。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				本工具将输入文本按
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">输入编码</code>
				转成字节，再用下方的
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">12</code>
				种常见字符集逐一解码，让你一眼看到同一份文本在各种编码下的真实效果。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：排查网页或数据库乱码、判断文本的真实编码、在不同系统间搬运含中文的文件。
			</p>
		</div>
	</div>
</template>
