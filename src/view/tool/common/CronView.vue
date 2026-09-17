<script lang="ts" setup>
	import { computed, onBeforeUnmount, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		analyzeCron,
		buildBuilderContext,
		buildBuilderFields,
		CRON_PLACEHOLDERS,
		CRON_TEMPLATES,
		describeSyntax,
		hasAliasSyntax,
		previewCronRuns,
		replaceCronField
	} from '@/utils/cron';
	import { cronPresetCategories, cronPresets } from '@/data/cronPresets';
	import { icons } from '@/data/icons';
	import type { CronBuilderField, CronPreviewResult } from '@/types/cron';
	import AboutPanel from '@/fragment/tool/common/cron/AboutPanel.vue';
	import CronBuilder from '@/fragment/tool/common/cron/CronBuilder.vue';
	import CronEditor from '@/fragment/tool/common/cron/CronEditor.vue';
	import CronFieldBreakdown from '@/fragment/tool/common/cron/CronFieldBreakdown.vue';
	import CronIntroPanel from '@/fragment/tool/common/cron/CronIntroPanel.vue';
	import CronPresetList from '@/fragment/tool/common/cron/CronPresetList.vue';
	import CronPreviewPanel from '@/fragment/tool/common/cron/CronPreviewPanel.vue';
	import CronSectionNav from '@/fragment/tool/common/cron/CronSectionNav.vue';

	/** 默认示例：每天凌晨 2:30（5 段式） */
	const DEFAULT_EXPRESSION = '30 2 * * *';
	/** 预览条数可选档位 */
	const COUNT_OPTIONS = [5, 10, 20, 50];
	/** 「Cron 表达式介绍」页签中展示的示例表达式 */
	const INTRO_EXAMPLES = [
		'*/5 * * * *',
		'0 * * * *',
		'30 2 * * *',
		'0 9 * * 1-5',
		'0 0 1 * *',
		'0 0 L * *',
		'*/30 * * * * *',
		'0 9 * * 5#2'
	];
	/** 常规表达式的输入提示 */
	const NORMAL_HINT =
		'支持 5 段（分 时 日 月 周）、6 段（秒 分 时 日 月 周）、7 段（秒 分 时 日 月 周 年），以及 @daily 等别名写法';
	/** 别名表达式的输入提示 */
	const ALIAS_HINT = '这是别名 / 间隔写法：可正常解析与描述，但不支持逐字段修改与执行时间预览';
	/** 常用列表分组说明 */
	const CATEGORY_HINTS = [
		{ category: '高频周期', hint: '分钟级 / 小时级调度，适合监控采集与缓存刷新' },
		{ category: '每日固定时刻', hint: '每天固定时间点执行，适合报表、备份、结算类任务' },
		{ category: '工作日与周末', hint: '按星期限定，常见于工作日提醒与周末全量任务' },
		{ category: '每月计划', hint: '按月调度，含 L（最后一天）与季度写法' },
		{ category: '秒级（6 段）', hint: '需要秒级精度时使用 6 段式（Quartz 风格）' },
		{ category: '别名与间隔', hint: 'crond 别名与 @every 间隔写法，书写最简洁' }
	];

	/** 表达式文本 */
	const expression = ref(DEFAULT_EXPRESSION);
	/** 当前页签 */
	const activeTab = ref('parse');
	/** 预览条数 */
	const previewCount = ref(5);

	/** 页签列表 */
	const navItems = computed(() => [
		{ key: 'parse', label: '解析 / 预览', icon: icons.clock },
		{ key: 'build', label: '选单构建', icon: icons.tools },
		{ key: 'presets', label: '常用列表', icon: icons.notebook },
		{ key: 'about', label: 'Cron 表达式介绍', icon: icons.info }
	]);

	/** 解析结果：随输入实时更新（纯计算，开销很小） */
	const parsed = computed(() => analyzeCron(expression.value));
	/** 是否为别名 / 间隔写法 */
	const aliasSyntax = computed(() => hasAliasSyntax(expression.value));
	/** 输入框下方提示文案 */
	const editorHint = computed(() => (aliasSyntax.value ? ALIAS_HINT : NORMAL_HINT));
	/** 书写风格说明 */
	const syntaxText = computed(() => describeSyntax(parsed.value.syntax, parsed.value.hasSeconds, parsed.value.hasYear));
	/** 表达式是否合法，用于预览区空态与错误提示 */
	const parseOk = computed(() => parsed.value.ok && !aliasSyntax.value);

	// ---- 执行时间预览（解析失败或表达式过长扫描时可能较慢，做防抖）----
	const preview = ref<CronPreviewResult>({ items: [], remaining: 0 });
	let previewTimer: ReturnType<typeof setTimeout> | undefined;

	/** 重新计算执行时间预览 */
	function refreshPreview() {
		if (!parseOk.value) {
			preview.value = { items: [], remaining: 0 };
			return;
		}
		preview.value = previewCronRuns(expression.value, previewCount.value);
	}

	watch(
		[expression, previewCount, parseOk],
		() => {
			if (previewTimer) clearTimeout(previewTimer);
			previewTimer = setTimeout(refreshPreview, 200);
		},
		{ immediate: true }
	);

	onBeforeUnmount(() => {
		if (previewTimer) clearTimeout(previewTimer);
	});

	// ---- 选单构建 ----
	/** 构建器上下文：字段分片与类型 */
	const builderContext = computed(() => buildBuilderContext(expression.value));
	/** 构建器字段配置（别名表达式或非法表达式时给出标准 5 段骨架） */
	const builderFields = computed<CronBuilderField[]>(() => {
		const context = builderContext.value;
		const usable = context.ok && !aliasSyntax.value ? context : buildBuilderContext(DEFAULT_EXPRESSION);
		return buildBuilderFields(usable);
	});
	/** 构建器是否可编辑 */
	const builderEditable = computed(() => parsed.value.ok && !aliasSyntax.value);
	/** 构建器不可用时的说明 */
	const builderDisabledHint = computed(() =>
		aliasSyntax.value ? '别名 / 间隔写法无法逐字段编辑，请先在「常用列表」载入等价写法' : '表达式有误，无法逐字段编辑'
	);

	/** 切换某个字段的取值（下拉选择） */
	function handleBuilderSelect(field: CronBuilderField, value: string) {
		expression.value = replaceCronField(expression.value, field.index, value);
	}

	/** 自定义修改某个字段（文本输入） */
	function handleBuilderInput(field: CronBuilderField, raw: string) {
		expression.value = replaceCronField(expression.value, field.index, raw);
	}

	// ---- 交互动作 ----
	/** 使用模板 / 常用表达式 */
	function useExpression(value: string) {
		expression.value = value;
		activeTab.value = 'parse';
	}

	/** 在表达式末尾追加片段（特殊字符快捷插入） */
	function appendToken(token: string) {
		const current = expression.value.trimEnd();
		expression.value = current ? `${current}${token}` : token;
	}

	/** 复制文本并提示 */
	function copy(value: string) {
		copyToClipboard(value);
	}

	/** 复制全部执行时间 */
	function copyAllRuns() {
		const text = preview.value.items.map((item) => item.localText).join('\n');
		copyToClipboard(text, `已复制 ${preview.value.items.length} 条执行时间`);
	}

	/** 重置为默认示例 */
	function resetExpression() {
		expression.value = DEFAULT_EXPRESSION;
	}

	/** 清空表达式 */
	function clearExpression() {
		expression.value = '';
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：什么是 Cron 表达式（仅解析页签展示，完整速查见介绍页签） -->
		<AboutPanel />

		<!-- CronSectionNav：解析 / 预览、选单构建、常用列表、Cron 表达式介绍 页签 -->
		<CronSectionNav v-model="activeTab" :items="navItems" />

		<!-- 解析与预览 -->
		<template v-if="activeTab === 'parse'">
			<!-- CronEditor：表达式输入、示例模板与特殊字符插入 -->
			<CronEditor
				:alias-hint="editorHint"
				:expression="expression"
				:parsed="parsed"
				:placeholders="CRON_PLACEHOLDERS"
				:syntax-text="syntaxText"
				:templates="CRON_TEMPLATES"
				@clear="clearExpression"
				@parse="refreshPreview"
				@reset="resetExpression"
				@append-token="appendToken"
				@update:expression="(value: string) => (expression = value)"
				@use-template="useExpression"
			/>

			<!-- CronFieldBreakdown：中文语义描述与逐字段拆解 -->
			<CronFieldBreakdown :parsed="parsed" @copy="copy" />

			<!-- CronPreviewPanel：接下来 N 次执行时间（本地 / UTC 双列） -->
			<CronPreviewPanel
				:count="previewCount"
				:count-options="COUNT_OPTIONS"
				:items="preview.items"
				:ok="parseOk"
				:remaining="preview.remaining"
				@copy="copy"
				@copy-all="copyAllRuns"
				@update:count="(value: number) => (previewCount = value)"
			/>
		</template>

		<!-- 选单构建 -->
		<template v-else-if="activeTab === 'build'">
			<!-- CronBuilder：逐字段选择常用取值或自定义片段 -->
			<CronBuilder
				:disabled-hint="builderDisabledHint"
				:editable="builderEditable"
				:fields="builderFields"
				@input="handleBuilderInput"
				@select="handleBuilderSelect"
			/>
			<!-- CronFieldBreakdown：构建过程中的实时语义反馈 -->
			<CronFieldBreakdown :parsed="parsed" @copy="copy" />
		</template>

		<!-- 常用列表 -->
		<template v-else-if="activeTab === 'presets'">
			<!-- CronPresetList：常用 cron 表达式库（分组 + 搜索 + 一键载入） -->
			<CronPresetList
				:categories="cronPresetCategories"
				:category-hints="CATEGORY_HINTS"
				:expression="expression"
				:presets="cronPresets"
				@copy="copy"
				@load="useExpression"
			/>
		</template>

		<!-- Cron 表达式介绍 -->
		<template v-else>
			<!-- CronIntroPanel：字段结构、特殊字符含义、易错点提醒与快速上手示例 -->
			<CronIntroPanel :example-expressions="INTRO_EXAMPLES" :presets="cronPresets" @load="useExpression" />
		</template>
	</div>
</template>
