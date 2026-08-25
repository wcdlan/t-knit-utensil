<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import InputPanel from '@/fragment/tool/text/word-count/InputPanel.vue';
	import StatsPanel from '@/fragment/tool/text/word-count/StatsPanel.vue';
	import AboutPanel from '@/fragment/tool/text/word-count/AboutPanel.vue';
	import type { WordCountStats } from '@/types/word-count';

	const text = ref('');

	const stats = computed<WordCountStats>(() => {
		const content = text.value;
		if (!content) {
			return { chars: 0, charsNoSpace: 0, words: 0, lines: 0, paragraphs: 0, bytes: 0, chineseChars: 0, numbers: 0 };
		}

		const chars = content.length;
		const charsNoSpace = content.replace(/\s/g, '').length;
		const words = content.trim() ? content.trim().split(/\s+/).length : 0;
		const lines = content.split(/\r?\n/).length;
		const paragraphs = content
			.replace(/\n$/, '')
			.split(/\n\s*\n/)
			.filter((p) => p.trim()).length;
		const bytes = new TextEncoder().encode(content).length;
		const chineseChars = (content.match(/[一-鿿]/g) || []).length;
		const numbers = (content.match(/\d+/g) || []).length;

		return { chars, charsNoSpace, words, lines, paragraphs, bytes, chineseChars, numbers };
	});
</script>

<template>
	<div class="space-y-6">
		<!-- InputPanel：待统计的文本输入区 -->
		<InputPanel v-model:model-value="text" />
		<!-- StatsPanel：统计指标展示面板（字符 / 单词 / 行数 / 段落 / 字节 / 中文字符等） -->
		<StatsPanel :empty="!text" :stats="stats" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
