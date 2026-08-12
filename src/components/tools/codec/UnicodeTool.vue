<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'to-unicode' | 'to-chinese'>('to-unicode');

	function process() {
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

	function copy() {
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
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 6, maxRows: 16 }"
				:placeholder="mode === 'to-unicode' ? '输入中文文本...' : '输入 Unicode 编码 (如 \\u4e2d\\u6587)...'"
				type="textarea"
			/>
		</div>

		<!-- Action button -->
		<n-button type="primary" @click="process">
			<span class="flex items-center gap-1.5">
				<span>转换</span>
				<span class="text-xs opacity-60">&rarr;</span>
			</span>
		</n-button>

		<!-- Output section -->
		<div v-if="output">
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button secondary size="tiny" @click="copy">复制</n-button>
				</div>
			</div>
			<n-input :autosize="{ minRows: 6, maxRows: 16 }" :value="output" readonly type="textarea" />
		</div>

		<!-- Empty state -->
		<div v-if="!input && !output" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 text-slate-300">
				<TkuIcon :name="icons.textFormat" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">输入文本后点击「转换」开始处理</p>
		</div>
	</div>
</template>
