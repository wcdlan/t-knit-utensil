<script lang="ts" setup>
	import { ref } from 'vue'

	const input = ref('')
	const output = ref('')
	const mode = ref<'encode' | 'decode'>('encode')

	function process() {
		try {
			if (mode.value === 'encode') {
				output.value = btoa(unescape(encodeURIComponent(input.value)))
			} else {
				output.value = decodeURIComponent(escape(atob(input.value)))
			}
		} catch {
			output.value = '转换失败，请检查输入内容'
		}
	}

	function copy() {
		navigator.clipboard.writeText(output.value)
	}

	function swap() {
		input.value = output.value
		mode.value = mode.value === 'encode' ? 'decode' : 'encode'
		output.value = ''
	}
</script>

<template>
	<div class="space-y-4">
		<div class="flex gap-2">
			<button
				:class="mode === 'encode' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
				class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
				@click="mode = 'encode'"
			>
				编码
			</button>
			<button
				:class="mode === 'decode' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
				class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
				@click="mode = 'decode'"
			>
				解码
			</button>
		</div>
		<textarea
			v-model="input"
			:placeholder="mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'"
			class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
			rows="6"
		></textarea>
		<div class="flex gap-2">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
				@click="process"
			>
				转换
			</button>
			<button
				v-if="output"
				class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
				@click="swap"
			>
				交换
			</button>
		</div>
		<div v-if="output" class="relative">
			<textarea
				:value="output"
				class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 resize-y"
				readonly
				rows="6"
			></textarea>
			<button
				class="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
				@click="copy"
			>
				复制
			</button>
		</div>
	</div>
</template>
