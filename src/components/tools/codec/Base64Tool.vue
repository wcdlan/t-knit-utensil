<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NButtonGroup, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');
	const mode = ref<'encode' | 'decode'>('encode');

	function process() {
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

	function copy() {
		copyToClipboard(output.value);
	}

	function swap() {
		input.value = output.value;
		mode.value = mode.value === 'encode' ? 'decode' : 'encode';
		output.value = '';
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
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 6, maxRows: 16 }"
				:placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'"
				type="textarea"
			/>
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
				<TkuIcon :name="icons.pencil" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">输入文本后点击「转换」开始处理</p>
		</div>
	</div>
</template>
