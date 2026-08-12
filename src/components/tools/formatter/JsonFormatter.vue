<script lang="ts" setup>
	import { ref } from 'vue';
	import { NAlert, NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	const input = ref('');
	const output = ref('');
	const error = ref('');

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
			error.value = '✓ JSON 格式正确';
			output.value = '';
		} catch (e) {
			error.value = '✗ JSON 格式错误: ' + (e as Error).message;
			output.value = '';
		}
	}

	function copy() {
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
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 8, maxRows: 20 }"
				placeholder='粘贴 JSON 数据，例如: {"name": "test"}'
				type="textarea"
			/>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-wrap items-center gap-2">
			<n-button type="primary" @click="format">
				<span class="flex items-center gap-1.5">✨ 格式化</span>
			</n-button>
			<n-button type="info" @click="compress">
				<span class="flex items-center gap-1.5">📦 压缩</span>
			</n-button>
			<n-button type="success" @click="validate">
				<span class="flex items-center gap-1.5">✓ 校验</span>
			</n-button>
		</div>

		<!-- Feedback alert -->
		<n-alert v-if="error" :type="error.startsWith('✓') ? 'success' : 'error'" class="text-sm">
			{{ error }}
		</n-alert>

		<!-- Output section -->
		<div v-if="output && !error.startsWith('✓')">
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button secondary size="tiny" @click="copy">复制</n-button>
				</div>
			</div>
			<n-input :autosize="{ minRows: 10, maxRows: 24 }" :value="output" readonly type="textarea" />
		</div>

		<!-- Empty state -->
		<div v-if="!input && !output && !error" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="text-4xl mb-3 opacity-30">📋</div>
			<p class="text-slate-400 text-sm">粘贴 JSON 数据后选择操作</p>
		</div>
	</div>
</template>
