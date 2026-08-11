<script lang="ts" setup>
	import { onMounted, onUnmounted, ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	const now = ref(Math.floor(Date.now() / 1000));
	const nowMs = ref(Date.now());
	const nowStr = ref('');
	const tsInput = ref('');
	const tsResult = ref('');
	const dateInput = ref('');
	const dateResult = ref('');

	let timer: ReturnType<typeof setInterval>;

	function updateNow() {
		now.value = Math.floor(Date.now() / 1000);
		nowMs.value = Date.now();
		nowStr.value = new Date().toLocaleString('zh-CN');
	}

	onMounted(() => {
		updateNow();
		timer = setInterval(updateNow, 1000);
		dateInput.value = new Date().toISOString().slice(0, 16);
	});

	onUnmounted(() => clearInterval(timer));

	function tsToDate() {
		const ts = parseInt(tsInput.value);
		if (isNaN(ts)) {
			tsResult.value = '请输入有效的时间戳';
			return;
		}
		const ms = ts > 9999999999 ? ts : ts * 1000;
		tsResult.value = new Date(ms).toLocaleString('zh-CN');
	}

	function dateToTs() {
		const d = new Date(dateInput.value);
		if (isNaN(d.getTime())) {
			dateResult.value = '请输入有效的日期时间';
			return;
		}
		dateResult.value = `秒级: ${Math.floor(d.getTime() / 1000)}\n毫秒级: ${d.getTime()}`;
	}

	function copy(el: string) {
		const text = el === 'now' ? String(now.value) : el === 'nowMs' ? String(nowMs.value) : tsResult.value;
		copyToClipboard(text);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Current Time -->
		<div class="p-4 bg-blue-50 rounded-lg">
			<h3 class="text-sm font-semibold text-blue-900 mb-2">当前时间</h3>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
				<div class="flex items-center justify-between bg-white p-3 rounded border border-blue-100">
					<span class="text-gray-500">秒级时间戳</span>
					<code class="font-mono font-semibold text-blue-700">{{ now }}</code>
					<n-button size="tiny" @click="copy('now')">复制</n-button>
				</div>
				<div class="flex items-center justify-between bg-white p-3 rounded border border-blue-100">
					<span class="text-gray-500">毫秒级时间戳</span>
					<code class="font-mono font-semibold text-blue-700">{{ nowMs }}</code>
					<n-button size="tiny" @click="copy('nowMs')">复制</n-button>
				</div>
				<div class="flex items-center justify-between bg-white p-3 rounded border border-blue-100">
					<span class="text-gray-500">本地时间</span>
					<span class="font-semibold text-blue-700">{{ nowStr }}</span>
				</div>
			</div>
		</div>

		<!-- Timestamp to Date -->
		<div>
			<h3 class="text-sm font-semibold text-gray-700 mb-2">时间戳 → 日期</h3>
			<div class="flex gap-2">
				<n-input v-model:value="tsInput" class="flex-1" placeholder="输入时间戳 (秒或毫秒)" />
				<n-button type="primary" @click="tsToDate"> 转换 </n-button>
			</div>
			<div v-if="tsResult" class="mt-2 p-3 bg-gray-50 rounded-lg text-sm font-mono">
				{{ tsResult }}
			</div>
		</div>

		<!-- Date to Timestamp -->
		<div>
			<h3 class="text-sm font-semibold text-gray-700 mb-2">日期 → 时间戳</h3>
			<div class="flex gap-2">
				<input
					v-model="dateInput"
					class="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					type="datetime-local"
				/>
				<n-button type="primary" @click="dateToTs"> 转换 </n-button>
			</div>
			<div v-if="dateResult" class="mt-2 p-3 bg-gray-50 rounded-lg text-sm font-mono whitespace-pre">
				{{ dateResult }}
			</div>
		</div>
	</div>
</template>
