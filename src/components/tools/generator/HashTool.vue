<script lang="ts" setup>
	import { ref } from 'vue'

	const input = ref('')
	const algorithm = ref('MD5')
	const output = ref('')

	const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

	async function generateHash() {
		if (!input.value) return
		const msgUint8 = new TextEncoder().encode(input.value)
		const hashBuffer = await crypto.subtle.digest(algorithm.value, msgUint8)
		const hashArray = Array.from(new Uint8Array(hashBuffer))
		output.value = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	}

	function copy() {
		navigator.clipboard.writeText(output.value)
	}
</script>

<template>
	<div class="space-y-4">
		<div class="flex gap-2">
			<select
				v-model="algorithm"
				class="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
			>
				<option v-for="alg in algorithms" :key="alg" :value="alg">{{ alg }}</option>
			</select>
		</div>
		<textarea
			v-model="input"
			class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
			placeholder="输入要计算哈希的文本..."
			rows="5"
		></textarea>
		<button
			class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
			@click="generateHash"
		>
			计算
		</button>
		<div v-if="output" class="space-y-1">
			<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
				<code class="text-sm font-mono text-gray-700 break-all">{{ output }}</code>
				<button
					class="ml-3 px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 flex-shrink-0 transition cursor-pointer"
					@click="copy"
				>
					复制
				</button>
			</div>
		</div>
	</div>
</template>
