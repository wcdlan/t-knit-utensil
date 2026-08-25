<script lang="ts" setup>
	import { onMounted, onUnmounted, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import type { TimestampNowKind } from '@/types/timestamp';
	import CurrentTimePanel from '@/fragment/tool/converter/timestamp/CurrentTimePanel.vue';
	import TsToDatePanel from '@/fragment/tool/converter/timestamp/TsToDatePanel.vue';
	import DateToTsPanel from '@/fragment/tool/converter/timestamp/DateToTsPanel.vue';
	import AboutPanel from '@/fragment/tool/converter/timestamp/AboutPanel.vue';

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

	function formatTs(input: string, ms: boolean): string {
		if (input.trim() === '') {
			return '';
		}
		const ts = parseInt(input);
		if (isNaN(ts)) {
			return '请输入有效的时间戳';
		}
		return new Date(ms ? ts : ts * 1000).toLocaleString('zh-CN');
	}

	function dateToTs() {
		if (dateInput.value === null) {
			dateResult.value = '请输入有效的日期时间';
			return;
		}
		dateResult.value = `秒级: ${Math.floor(dateInput.value / 1000)}\n毫秒级: ${dateInput.value}`;
	}

	watch(secInput, (v) => (secResult.value = formatTs(v, false)));
	watch(msInput, (v) => (msResult.value = formatTs(v, true)));
	watch(dateInput, dateToTs);

	function copy(kind: TimestampNowKind) {
		const text = kind === 'now' ? String(now.value) : String(nowMs.value);
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
		<!-- CurrentTimePanel：实时当前时间展示（秒级 / 毫秒级时间戳 + 格式化日期，点击复制） -->
		<CurrentTimePanel :now="now" :now-ms="nowMs" :now-str="nowStr" @copy="copy" />
		<!-- TsToDatePanel：时间戳转日期面板（秒级 / 毫秒级输入并实时转换） -->
		<TsToDatePanel
			v-model:ms-value="msInput"
			v-model:sec-value="secInput"
			:ms-result="msResult"
			:sec-result="secResult"
			@copy-sec="copySec"
			@copy-ms="copyMs"
		/>
		<!-- DateToTsPanel：日期转时间戳面板（日期时间选择器 + 秒级 / 毫秒级结果） -->
		<DateToTsPanel
			v-model:date-value="dateInput"
			:date-result="dateResult"
			@copy="() => copyToClipboard(dateResult || '')"
		/>
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel :now="now" :now-ms="nowMs" />
	</div>
</template>
