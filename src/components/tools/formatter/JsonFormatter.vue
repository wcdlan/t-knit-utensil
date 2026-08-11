<script lang="ts" setup>
	import { ref } from 'vue'

	const input = ref('')
	const output = ref('')
	const error = ref('')

	function format() {
		try {
			error.value = ''
			output.value = JSON.stringify(JSON.parse(input.value), null, 2)
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message
			output.value = ''
		}
	}

	function compress() {
		try {
			error.value = ''
			output.value = JSON.stringify(JSON.parse(input.value))
		} catch (e) {
			error.value = 'JSON 格式错误: ' + (e as Error).message
			output.value = ''
		}
	}

	function validate() {
		try {
			JSON.parse(input.value)
			error.value = ''
			output.value = '✓ JSON 格式正确'
		} catch (e) {
			error.value = '✗ JSON 格式错误: ' + (e as Error).message
			output.value = ''
		}
	}

	function copy() {
		navigator.clipboard.writeText(output.value)
	}
</script>

<template>
	<div class="space-y-4">
		<textarea
			v-model="input"
			class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
			placeholder='粘贴 JSON 数据，例如: {"name": "test"}'
			rows="8"
		></textarea>
		<div class="flex flex-wrap gap-2">
			<button
				class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
				@click="format"
			>
				格式化
			</button>
			<button
				class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
				@click="compress"
			>
				压缩
			</button>
			<button
				class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition cursor-pointer"
				@click="validate"
			>
				校验
			</button>
		</div>
		<div
			v-if="error"
			:class="error.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'"
			class="p-3 rounded-lg text-sm"
		>
			{{ error }}
		</div>
		<div v-if="output && !error" class="relative">
			<textarea
				:value="output"
				class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 resize-y"
				readonly
				rows="10"
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
