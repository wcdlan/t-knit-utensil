<script lang="ts" setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import { KEYBOARD_LAYOUT_OPTIONS, KEYBOARD_LAYOUTS } from '@/data/keyboard';
	import {
		calcApm,
		countLayoutKeys,
		detectDefaultLayout,
		formatClockTime,
		formatCombo,
		keyCodeOf,
		keyLabelOf,
		locationOf,
		shouldPreventDefault
	} from '@/utils/keyboard';
	import type { KeyboardLayout, KeyboardStats, KeyHistoryEntry, LiveKeyInfo } from '@/types/keyboard';
	import AboutPanel from '@/fragment/tool/common/keyboard-tester/AboutPanel.vue';
	import LayoutSelect from '@/fragment/tool/common/keyboard-tester/LayoutSelect.vue';
	import KeyboardModel from '@/fragment/tool/common/keyboard-tester/KeyboardModel.vue';
	import LiveKeyPanel from '@/fragment/tool/common/keyboard-tester/LiveKeyPanel.vue';
	import StatsPanel from '@/fragment/tool/common/keyboard-tester/StatsPanel.vue';
	import HistoryPanel from '@/fragment/tool/common/keyboard-tester/HistoryPanel.vue';

	/** 输入历史上限 */
	const HISTORY_LIMIT = 50;

	// ---- 布局 ----
	/** 默认按当前系统环境推断（macOS → mac，其余 → win） */
	const defaultLayout = detectDefaultLayout();
	const layoutId = ref<KeyboardLayout>(defaultLayout);
	const layout = computed(() => KEYBOARD_LAYOUTS.find((l) => l.id === layoutId.value) ?? KEYBOARD_LAYOUTS[0]);
	const keysTotal = computed(() => countLayoutKeys(layout.value));

	// ---- 按键状态 ----
	/** 当前按住的物理键位（组合键测试依据，多个键同时高亮） */
	const pressed = ref<string[]>([]);
	/** 本次测试中命中过的键位（浅色标记，便于排查已测按键） */
	const tested = ref<string[]>([]);
	/** 最近一次按下的按键原始信息 */
	const lastKey = ref<{ key: string; code: string } | null>(null);
	const history = ref<KeyHistoryEntry[]>([]);
	let historySeq = 0;

	// ---- 统计 ----
	const pressTimestamps = ref<number[]>([]);
	const total = ref(0);
	const peakApm = ref(0);
	const startedAt = ref<number | null>(null);
	/** 定时器驱动的“当前时刻”，用于让 APM 与时长随时间衰减 / 增长 */
	const now = ref(Date.now());

	// 首次按键才开始计时，未开始时 APM 与时长保持 0
	const stats = computed<KeyboardStats>(() => {
		const start = startedAt.value;
		const elapsed = start === null ? 0 : now.value - start;
		return {
			total: total.value,
			unique: tested.value.length,
			keysTotal: keysTotal.value,
			apm: start === null ? 0 : calcApm(pressTimestamps.value, now.value, start),
			peakApm: peakApm.value,
			elapsed
		};
	});

	/** 键位覆盖率重置：切换布局时清空已测试标记与统计，避免跨布局数据混淆 */
	function resetStats() {
		pressed.value = [];
		tested.value = [];
		lastKey.value = null;
		history.value = [];
		pressTimestamps.value = [];
		total.value = 0;
		peakApm.value = 0;
		startedAt.value = null;
		now.value = Date.now();
	}

	function switchLayout(value: KeyboardLayout) {
		if (value === layoutId.value) return;
		layoutId.value = value;
		resetStats();
	}

	/** 当前面板展示的按键信息：优先取实时按住的组合键 */
	const liveInfo = computed<LiveKeyInfo | null>(() => {
		if (!lastKey.value) return null;
		const codes = pressed.value.length ? pressed.value : [lastKey.value.code];
		const modifiers = codes.filter((code) => ['Control', 'Shift', 'Alt', 'Meta', 'Fn'].some((m) => code.startsWith(m)));
		return {
			key: lastKey.value.key,
			code: lastKey.value.code,
			keyCode: keyCodeOf(lastKey.value.code),
			location: locationOf(lastKey.value.code),
			combo: formatCombo(codes, layoutId.value),
			modifiers: modifiers.map((code) => keyLabelOf(code))
		};
	});

	const holding = computed(() => pressed.value.length > 0);

	function handleKeydown(e: KeyboardEvent) {
		// 拦截浏览器默认行为（Tab 切焦点、Space 滚动、/ 快速查找等），放行刷新与开发者工具
		if (shouldPreventDefault(e)) e.preventDefault();

		// 记录按住的键位：长按重复触发时不重复入栈
		if (!pressed.value.includes(e.code)) {
			pressed.value = [...pressed.value, e.code];
		}

		lastKey.value = { key: e.key, code: e.code };

		// 已测试键位去重累积
		if (!tested.value.includes(e.code)) {
			tested.value = [...tested.value, e.code];
		}

		// 长按重复不重复计数，仅记录历史并标记
		if (!e.repeat) {
			total.value += 1;
			const stamp = Date.now();
			if (startedAt.value === null) startedAt.value = stamp;
			pressTimestamps.value = [...pressTimestamps.value, stamp];
			now.value = stamp;
			// 实时刷新 APM 峰值
			const currentApm = calcApm(pressTimestamps.value, stamp, startedAt.value);
			peakApm.value = Math.max(peakApm.value, currentApm);
		}

		// 记录输入历史（最新在前，超出上限截断）
		const entry: KeyHistoryEntry = {
			id: ++historySeq,
			key: e.key === ' ' ? 'Space' : e.key,
			code: e.code,
			keyCode: keyCodeOf(e.code),
			combo: formatCombo(pressed.value, layoutId.value),
			repeat: e.repeat,
			time: formatClockTime(new Date())
		};
		history.value = [entry, ...history.value].slice(0, HISTORY_LIMIT);
	}

	function handleKeyup(e: KeyboardEvent) {
		if (shouldPreventDefault(e)) e.preventDefault();
		pressed.value = pressed.value.filter((code) => code !== e.code);
	}

	/** 窗口失焦时清空按住状态，避免切走后按键“卡住”高亮 */
	function handleBlur() {
		pressed.value = [];
	}

	let tickTimer: number | undefined;

	onMounted(() => {
		// 捕获阶段监听，确保先于页面其他快捷键处理
		window.addEventListener('keydown', handleKeydown, true);
		window.addEventListener('keyup', handleKeyup, true);
		window.addEventListener('blur', handleBlur);
		// 周期性刷新时刻：让 APM 随窗口滑动自然衰减、测试时长持续累加
		tickTimer = window.setInterval(() => {
			now.value = Date.now();
		}, 500);
	});

	onBeforeUnmount(() => {
		window.removeEventListener('keydown', handleKeydown, true);
		window.removeEventListener('keyup', handleKeyup, true);
		window.removeEventListener('blur', handleBlur);
		if (tickTimer !== undefined) window.clearInterval(tickTimer);
	});
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
		<!-- LayoutSelect：Windows / macOS 布局切换（默认按系统环境选中） -->
		<LayoutSelect
			:is-default-layout="layoutId === defaultLayout"
			:layout="layoutId"
			:options="KEYBOARD_LAYOUT_OPTIONS"
			@update:layout="switchLayout"
		/>

		<!-- KeyboardModel：完整键盘模型，实时高亮按下的按键（支持组合键同时高亮） -->
		<div class="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
			<KeyboardModel :layout="layout" :pressed="pressed" :tested="tested" />
		</div>

		<!-- 信息面板：当前按键信息 / 按键统计 / 输入历史 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr_1.2fr]">
			<!-- LiveKeyPanel：当前按键的 key / code / keyCode / 键区与组合键 -->
			<LiveKeyPanel :holding="holding" :info="liveInfo" />
			<!-- StatsPanel：总计按键 / APM / 峰值 / 时长与键位覆盖率 -->
			<StatsPanel :stats="stats" @reset="resetStats" />
			<!-- HistoryPanel：输入历史列表（最近 50 条，点击复制） -->
			<HistoryPanel :history="history" />
		</div>
	</div>
</template>
