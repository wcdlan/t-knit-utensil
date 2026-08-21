<script lang="ts" setup>
	import { onMounted, onUnmounted, type Ref, ref, watch } from 'vue';
	import { NButton, NDatePicker, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

	const now = ref(Math.floor(Date.now() / 1000));
	const nowMs = ref(Date.now());
	const nowStr = ref('');
	const secInput = ref('');
	const secResult = ref('');
	const msInput = ref('');
	const msResult = ref('');
	const dateInput = ref<number | null>(null);
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
		dateInput.value = Date.now();
	});

	onUnmounted(() => clearInterval(timer));

	function tsToDate(input: string, result: Ref<string>, ms: boolean) {
		if (input.trim() === '') {
			result.value = '';
			return;
		}
		const ts = parseInt(input);
		if (isNaN(ts)) {
			result.value = '请输入有效的时间戳';
			return;
		}
		result.value = new Date(ms ? ts : ts * 1000).toLocaleString('zh-CN');
	}

	function dateToTs() {
		if (dateInput.value === null) {
			dateResult.value = '请输入有效的日期时间';
			return;
		}
		dateResult.value = `秒级: ${Math.floor(dateInput.value / 1000)}\n毫秒级: ${dateInput.value}`;
	}

	watch(secInput, (v) => tsToDate(v, secResult, false));
	watch(msInput, (v) => tsToDate(v, msResult, true));
	watch(dateInput, dateToTs);

	function copy(el: string) {
		const text = el === 'now' ? String(now.value) : el === 'nowMs' ? String(nowMs.value) : '';
		if (text) copyToClipboard(text);
	}

	function copySec() {
		if (secResult.value) copyToClipboard(secResult.value);
	}

	function copyMs() {
		if (msResult.value) copyToClipboard(msResult.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Current Time -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">当前时间</h3>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
				<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
					<span class="text-slate-500 text-xs">秒级时间戳</span>
					<code class="font-mono font-semibold text-blue-700 tabular-nums">{{ now }}</code>
					<n-button secondary size="tiny" @click="copy('now')">复制</n-button>
				</div>
				<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
					<span class="text-slate-500 text-xs">毫秒级时间戳</span>
					<code class="font-mono font-semibold text-blue-700 tabular-nums">{{ nowMs }}</code>
					<n-button secondary size="tiny" @click="copy('nowMs')">复制</n-button>
				</div>
				<div class="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
					<span class="text-slate-500 text-xs">本地时间</span>
					<span class="font-semibold text-blue-700 tabular-nums">{{ nowStr }}</span>
				</div>
			</div>
		</div>

		<!-- Timestamp to Date -->
		<div>
			<h3 class="text-sm font-semibold text-slate-700 mb-2">时间戳 → 日期</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-2">秒级时间戳 (10 位)</label>
					<n-input v-model:value="secInput" class="!font-mono" placeholder="输入秒级时间戳" />
					<div
						:class="secResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
						class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono transition hover:bg-blue-50/60"
						@click="copySec"
					>
						{{ secResult || '输入时间戳后将显示转换结果' }}
					</div>
				</div>
				<div>
					<label class="block text-xs font-semibold text-slate-500 mb-2">毫秒级时间戳 (13 位)</label>
					<n-input v-model:value="msInput" class="!font-mono" placeholder="输入毫秒级时间戳" />
					<div
						:class="msResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
						class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono transition hover:bg-blue-50/60"
						@click="copyMs"
					>
						{{ msResult || '输入时间戳后将显示转换结果' }}
					</div>
				</div>
			</div>
		</div>

		<!-- Date to Timestamp -->
		<div>
			<h3 class="text-sm font-semibold text-slate-700 mb-2">日期 → 时间戳</h3>
			<div class="flex gap-2">
				<n-date-picker v-model:value="dateInput" class="flex-1" type="datetime" />
			</div>
			<div
				:class="dateResult ? 'text-slate-700 cursor-pointer' : 'text-slate-400'"
				class="mt-2 p-3 bg-slate-50 rounded-lg text-sm font-mono whitespace-pre transition hover:bg-blue-50/60"
				@click="copyToClipboard(dateResult || '')"
			>
				{{ dateResult || '选择日期后将显示时间戳转换结果' }}
			</div>
		</div>

		<!-- About Timestamp -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是时间戳？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-3">
				时间戳（Unix 时间戳）是从
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">1970-01-01 00:00:00 UTC</code>
				起经过的秒数或毫秒数。它用一个整数记录时刻，与时区无关，因此在数据传输、存储与对比时不会因时区不同而产生歧义。
			</p>
			<div class="text-sm text-slate-600 leading-relaxed mb-3">
				<p class="mb-1">根据精度的不同，时间戳分为两种：</p>
				<ul class="list-disc pl-5 space-y-1">
					<li>
						<span class="font-medium">秒级时间戳</span>（10 位数字，如
						<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{{ now }}</code
						>）：单位是秒，最常见的格式。
					</li>
					<li>
						<span class="font-medium">毫秒级时间戳</span>（13 位数字，如
						<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{{ nowMs }}</code
						>）：单位是毫秒，精度更高，常见于 JavaScript、Java 等语言中的默认值。
					</li>
				</ul>
			</div>
			<p class="text-sm text-slate-600 leading-relaxed mb-3">
				判断技巧：数一下位数即可，<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">10 位</code>是秒级，
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">13 位</code>是毫秒级。本工具的 「时间戳 →
				日期」会自动识别并转换。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：数据库与日志中记录时间、API 接口传参、Session / Token 过期校验、以及缓存过期时间设置等。顶部
				「当前时间」区域每秒实时刷新，可直接复制使用。
			</p>
		</div>
	</div>
</template>
