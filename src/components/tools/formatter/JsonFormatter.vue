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
		<div v-if="output && !error.startsWith(OK_PREFIX)">
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button secondary size="tiny" @click="copyOutput">复制</n-button>
				</div>
			</div>
			<n-input :autosize="{ minRows: 10, maxRows: 24 }" :value="output" readonly type="textarea" />
		</div>

		<!-- Empty state -->
		<div v-if="!input && !output && !error" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 text-slate-300">
				<TkuIcon :name="icons.clipboard" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">粘贴 JSON 数据后选择操作</p>
		</div>
	</div>
</template>
