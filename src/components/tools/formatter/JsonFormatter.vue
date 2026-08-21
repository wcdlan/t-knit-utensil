<script lang="ts" setup>
	import { ref } from 'vue';
	import { NAlert, NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const error = ref('');

	const OK_PREFIX = '[OK]';
	const ERR_PREFIX = '[ERR]';

	function format() {
		try {
			error.value = '';
			output.value = JSON.stringify(JSON.parse(input.value), null, 2);
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function compress() {
		try {
			error.value = '';
			output.value = JSON.stringify(JSON.parse(input.value));
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function validate() {
		try {
			JSON.parse(input.value);
			error.value = OK_PREFIX + ' JSON 格式正确';
			output.value = '';
		} catch (e) {
			error.value = ERR_PREFIX + ' JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function copyOutput() {
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">JSON 输入</label>
				<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
			</div>
			<div class="relative">
				<n-input
					v-model:value="input"
					:autosize="{ minRows: 8, maxRows: 20 }"
					placeholder='粘贴 JSON 数据，例如: {"name": "test"}'
					type="textarea"
				/>
				<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
				<div
					v-if="!input"
					class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
				>
					<div class="mb-2 text-slate-300">
						<TkuIcon :name="icons.clipboard" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">粘贴 JSON 数据后选择操作</p>
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-wrap items-center gap-2">
			<n-button type="primary" @click="format">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.star" :size="16" />
					<span>格式化</span>
				</span>
			</n-button>
			<n-button type="info" @click="compress">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.package" :size="16" />
					<span>压缩</span>
				</span>
			</n-button>
			<n-button type="success" @click="validate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.check" :size="16" />
					<span>校验</span>
				</span>
			</n-button>
		</div>

		<!-- Feedback alert -->
		<n-alert v-if="error" :type="error.startsWith(OK_PREFIX) ? 'success' : 'error'" class="text-sm">
			{{ error.replace(OK_PREFIX + ' ', '').replace(ERR_PREFIX + ' ', '') }}
		</n-alert>

		<!-- Output section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button :disabled="!output" secondary size="tiny" @click="copyOutput">复制</n-button>
				</div>
			</div>
			<div class="relative">
				<n-input
					:autosize="{ minRows: 10, maxRows: 24 }"
					:value="output"
					class="cursor-pointer"
					readonly
					type="textarea"
					@click="copyOutput"
				/>
				<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<span class="text-slate-300 text-xs">粘贴 JSON 数据后点击操作按钮</span>
				</div>
			</div>
		</div>

		<!-- About JSON -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 JSON？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				JSON（JavaScript Object
				Notation）是一种轻量级的数据交换格式，以「键值对」组织数据，支持对象、数组、字符串、数字、布尔值和
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">null</code>
				共 6 种数据类型。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				压缩格式将多余的空格和换行去掉，只保留结构所需的字符，体积更小，常用于接口日志、存储与传输；格式化则缩进换行、层次分明，便于阅读与调试。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				「校验」仅检查语法是否合法：合法的 JSON 必须是
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{...}</code>
				或
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">[...]</code>
				开头，字符串用双引号包裹，且不能有尾随逗号。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：调试前后端接口返回、解析配置文件、处理 API 请求体、以及将数据库查询结果转成 JSON 供程序使用。
			</p>
		</div>
	</div>
</template>
