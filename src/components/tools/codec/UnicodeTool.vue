<script lang="ts" setup>
	import { ref } from 'vue'

	const input = ref('')
	const output = ref('')
	const mode = ref<'to-unicode' | 'to-chinese'>('to-unicode')

	function process() {
		try {
			if (mode.value === 'to-unicode') {
				output.value = input.value
					.split('')
					.map((c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
					.join('')
			} else {
				output.value = input.value.replace(/\\u[\da-f]{4}/gi, (match) =>
					String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
				)
			}
		} catch {
			output.value = '转换失败'
		}
	}

	function copy() {
		navigator.clipboard.writeText(output.value)
	}
</script>

<template>
	<div class="space-y-4">
		<div class="flex gap-2">
			<button
				:class="mode === 'to-unicode' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
				class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
				@click="mode = 'to-unicode'"
			>
				中文 → Unicode
			</button>
			<button
				:class="mode === 'to-chinese' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'"
				class="px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
				@click="mode = 'to-chinese'"
			>
				Unicode → 中文
			</button>
		</div>
		<textarea
			v-model="input"
			:placeholder="mode === 'to-unicode' ? '输入中文文本...' : '输入 Unicode 编码 (如 \\u4e2d\\u6587)...'"
			class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
			rows="6"
		></textarea>
		<button
			class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
			@click="process"
		>
			转换
		</button>
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
