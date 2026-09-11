<script lang="ts" setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		buildDateFormats,
		formatWallClock,
		getCurrentTimezone,
		getTimezoneOptions,
		getZonedParts,
		parseDateTimeInput
	} from '@/utils/dateTime';
	import type { DateFormatItem, DateTimeParseResult } from '@/types/datetime';
	import AboutPanel from '@/fragment/tool/converter/date-converter/AboutPanel.vue';
	import InputPanel from '@/fragment/tool/converter/date-converter/InputPanel.vue';
	import TimezoneBar from '@/fragment/tool/converter/date-converter/TimezoneBar.vue';
	import ResultList from '@/fragment/tool/converter/date-converter/ResultList.vue';

	/** 本地时区（当前系统环境） */
	const localZone = getCurrentTimezone();
	/** 时区下拉选项（本地时区置顶，一次性生成） */
	const timezoneOptions = getTimezoneOptions();

	// ---- 状态 ----
	const input = ref('2024-01-15 10:30:00');
	/** 输入时区：解释不带时区标记的输入 */
	const inputZone = ref(localZone);
	/** 目标时区：输出展示所用时区 */
	const targetZone = ref(localZone);
	/** 用于相对时间展示的当前时刻（定期刷新） */
	const nowMs = ref(Date.now());

	/** 解析结果：随输入与输入时区变化实时重算 */
	const parseResult = computed<DateTimeParseResult>(() => parseDateTimeInput(input.value, inputZone.value));

	/** 各格式转换结果：仅在识别成功时生成 */
	const formats = computed<DateFormatItem[]>(() => {
		const result = parseResult.value;
		if (!result.ok) return [];
		return buildDateFormats(result.value.timestampMs, targetZone.value, nowMs.value);
	});

	/** 填入当前时间：按输入时区生成可直接解析的格式 */
	function useNow() {
		input.value = formatWallClock(getZonedParts(new Date(), inputZone.value));
	}

	function clearInput() {
		input.value = '';
	}

	/** 互换输入时区与目标时区 */
	function swapZones() {
		const previousInput = inputZone.value;
		inputZone.value = targetZone.value;
		targetZone.value = previousInput;
	}

	/** 重置为本地时区 */
	function useLocalZones() {
		inputZone.value = localZone;
		targetZone.value = localZone;
	}

	function copy(value: string) {
		if (!value) return;
		copyToClipboard(value);
	}

	/** 复制全部格式结果 */
	function copyAll() {
		if (!formats.value.length) return;
		const text = formats.value.map((item) => `${item.label}：${item.value}`).join('\n');
		copyToClipboard(text, '已复制全部格式');
	}

	let timer: number | undefined;

	onMounted(() => {
		// 定期刷新「相对当前时间」，保证结果随时间推移保持准确
		timer = window.setInterval(() => {
			nowMs.value = Date.now();
		}, 30000);
	});

	onBeforeUnmount(() => {
		if (timer !== undefined) window.clearInterval(timer);
	});
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具说明与解析规则概述 -->
		<AboutPanel />
		<!-- TimezoneBar：输入时区 / 目标时区选择与互换 -->
		<TimezoneBar
			v-model:input-zone="inputZone"
			v-model:target-zone="targetZone"
			:local-zone="localZone"
			:options="timezoneOptions"
			@swap="swapZones"
			@use-local="useLocalZones"
		/>
		<!-- InputPanel：日期时间输入 + 格式识别结果 / 异常提示 -->
		<InputPanel v-model:model-value="input" :parse-result="parseResult" @clear="clearInput" @use-now="useNow" />
		<!-- ResultList：20 种格式的转换结果（点击复制 / 复制全部） -->
		<ResultList :items="formats" @copy="copy" @copy-all="copyAll" />
	</div>
</template>
