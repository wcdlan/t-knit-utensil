<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { CASE_EXAMPLES, CASE_FORMATS, detectCaseFormats, splitWords } from '@/utils/caseConvert';
	import type { CaseResult } from '@/types/case';
	import AboutPanel from '@/fragment/tool/formatter/case-converter/AboutPanel.vue';
	import InputPanel from '@/fragment/tool/formatter/case-converter/InputPanel.vue';
	import ResultList from '@/fragment/tool/formatter/case-converter/ResultList.vue';

	const input = ref('myVariableName');
	const exampleIndex = ref(0);

	/** 当前输入拆分出的单词数组 */
	const words = computed(() => splitWords(input.value));
	/** 当前输入命中的格式集合 */
	const matchedIds = computed(() => detectCaseFormats(input.value));
	/** 各常用格式的转换结果（输入为空时结果为空串） */
	const results = computed<CaseResult[]>(() =>
		CASE_FORMATS.map((format) => ({ format, value: input.value.trim() ? format.convert(words.value) : '' }))
	);

	function applyExample() {
		exampleIndex.value = (exampleIndex.value + 1) % CASE_EXAMPLES.length;
		input.value = CASE_EXAMPLES[exampleIndex.value];
	}

	function clearInput() {
		input.value = '';
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
		<!-- InputPanel：变量名输入框（支持示例切换与清空，输入即实时转换） -->
		<InputPanel v-model:model-value="input" @clear="clearInput" @example="applyExample" />
		<!-- ResultList：全部常用格式的转换结果列表（命中当前输入格式的行高亮并标注「当前格式」） -->
		<ResultList :matched-ids="matchedIds" :results="results" />
	</div>
</template>
