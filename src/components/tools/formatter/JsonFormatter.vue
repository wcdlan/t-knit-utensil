<script lang="ts" setup>
	import { ref } from 'vue';
	import { NAlert, NButton, NInput, NSelect } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { generateRandomJson } from '@/utils/jsonGenerator';
	import type { JsonGenMode } from '@/types/json';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const error = ref('');

	const OK_PREFIX = '[OK]';
	const ERR_PREFIX = '[ERR]';

	// ---- 随机 JSON 生成 ----
	const genMode = ref<JsonGenMode>('rich');
	const genModeOptions = [
		{ label: '全格式（丰富）', value: 'rich' },
		{ label: '基础对象', value: 'basic' },
		{ label: '精简', value: 'compact' },
		{ label: '数组集合', value: 'array' },
		{ label: '深层嵌套', value: 'deep' }
	];

	function generateRandom() {
		error.value = '';
		const json = generateRandomJson(genMode.value, true);
		input.value = json;
		output.value = '';
	}

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
			// 校验通过后自动格式化为输出结果
			output.value = JSON.stringify(JSON.parse(input.value), null, 2);
			error.value = OK_PREFIX + ' JSON 格式正确，已自动格式化';
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
	<div class="flex flex-col min-h-0 flex-1 space-y-6">
		<!-- 生成随机 JSON 工具条（页面上端） -->
		<div
			class="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-3 flex-shrink-0"
		>
			<span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
				<TkuIcon :name="icons.star" :size="14" />
				生成随机 JSON
			</span>
			<n-select v-model:value="genMode" :options="genModeOptions" class="!w-[180px] !max-w-full" size="small" />
			<n-button size="small" type="primary" @click="generateRandom">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.lightning" :size="14" />
					<span>生成</span>
				</span>
			</n-button>
			<span class="text-[11px] text-slate-400 ml-auto hidden sm:inline">
				生成结果自动填入左侧输入框，可直接进行格式化 / 压缩 / 校验
			</span>
		</div>

		<!-- Editor area: left input / buttons center / right output -->
		<div class="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch flex-1 min-h-0">
			<!-- Input section -->
			<div class="flex flex-col min-h-0">
				<div class="flex items-center justify-between mb-2 flex-shrink-0">
					<label class="text-xs font-semibold text-slate-500">JSON 输入</label>
					<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
				</div>
				<div class="relative flex-1 min-h-0 json-pane">
					<n-input
						v-model:value="input"
						class="h-full min-h-0"
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

			<!-- Action buttons (vertically centered between input/output) -->
			<div class="flex lg:flex-col items-stretch justify-center gap-2 py-2">
				<n-button class="w-full" type="primary" @click="format">
					<span class="flex w-full items-center gap-1.5">
						<TkuIcon :name="icons.star" :size="16" class="shrink-0" />
						<span class="flex-1 text-center">格式化</span>
					</span>
				</n-button>
				<n-button class="w-full" type="info" @click="compress">
					<span class="flex w-full items-center gap-1.5">
						<TkuIcon :name="icons.package" :size="16" class="shrink-0" />
						<span class="flex-1 text-center">压缩</span>
					</span>
				</n-button>
				<n-button class="w-full" type="success" @click="validate">
					<span class="flex w-full items-center gap-1.5">
						<TkuIcon :name="icons.check" :size="16" />
						<span class="flex-1 text-center">校验</span>
					</span>
				</n-button>
			</div>

			<!-- Output section -->
			<div class="flex flex-col min-h-0">
				<div class="flex items-center justify-between mb-2 flex-shrink-0">
					<label class="text-xs font-semibold text-slate-500">输出结果</label>
					<div class="flex items-center gap-2">
						<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
						<n-button :disabled="!output" secondary size="tiny" @click="copyOutput">复制</n-button>
					</div>
				</div>
				<div class="relative flex-1 min-h-0 json-pane">
					<n-input :value="output" class="h-full min-h-0 cursor-pointer" readonly type="textarea" @click="copyOutput" />
					<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
						<span class="text-slate-300 text-xs">粘贴 JSON 数据后点击操作按钮</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Feedback alert -->
		<n-alert v-if="error" :type="error.startsWith(OK_PREFIX) ? 'success' : 'error'" class="text-sm flex-shrink-0">
			{{ error.replace(OK_PREFIX + ' ', '').replace(ERR_PREFIX + ' ', '') }}
		</n-alert>

		<!-- About JSON -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex-shrink-0">
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

<style scoped>
	/* 让左侧输入 / 右侧输出的 textarea 撑满各自容器，内部滚动，随页面自适应拉伸不溢出 */
	.json-pane :deep(.n-input),
	.json-pane :deep(.n-input-wrapper),
	.json-pane :deep(.n-input__textarea),
	.json-pane :deep(.n-input__textarea .n-scrollbar),
	.json-pane :deep(.n-input__textarea .n-scrollbar-container),
	.json-pane :deep(.n-input__textarea .n-scrollbar-content) {
		height: 100%;
	}

	.json-pane :deep(.n-input) {
		display: flex;
		flex-direction: column;
	}

	.json-pane :deep(.n-input-wrapper) {
		flex: 1;
	}
</style>
