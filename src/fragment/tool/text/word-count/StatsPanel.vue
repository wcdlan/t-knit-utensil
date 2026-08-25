<script lang="ts" setup>
	import StatCard from './StatCard.vue';
	import type { WordCountStats } from '@/types/word-count';

	defineProps<{
		stats: WordCountStats;
		empty: boolean;
	}>();
</script>

<template>
	<div v-if="!empty" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<StatCard :value="stats.chars" accent="blue" label="总字符数" />
		<StatCard :value="stats.charsNoSpace" accent="emerald" label="字符数(无空格)" />
		<StatCard :value="stats.words" accent="purple" label="单词数" />
		<StatCard :value="stats.chineseChars" accent="orange" label="中文字符" />
		<StatCard :value="stats.lines" accent="pink" label="行数" />
		<StatCard :value="stats.paragraphs" accent="indigo" label="段落数" />
		<StatCard :value="stats.numbers" accent="teal" label="数字组数" />
		<StatCard :value="stats.bytes" accent="slate" label="字节数 (UTF-8)" />
	</div>
	<div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<StatCard v-for="n in 8" :key="n" :value="0" accent="placeholder" label="输入文本后将显示统计" />
	</div>
</template>
