<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NInput } from 'naive-ui';

	const text = ref('');

	const stats = computed(() => {
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
		<!-- Input -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">文本内容</label>
				<span class="text-[10px] text-slate-400">{{ text.length }} 字符</span>
			</div>
			<n-input v-model:value="text" :autosize="{ minRows: 10 }" placeholder="输入或粘贴文本..." type="textarea" />
		</div>

		<!-- Stats grid -->
		<div v-if="text" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<div class="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
				<div class="text-2xl font-bold text-blue-600 tabular-nums">{{ stats.chars }}</div>
				<div class="text-xs text-blue-500 mt-1">总字符数</div>
			</div>
			<div class="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
				<div class="text-2xl font-bold text-emerald-600 tabular-nums">{{ stats.charsNoSpace }}</div>
				<div class="text-xs text-emerald-500 mt-1">字符数(无空格)</div>
			</div>
			<div class="p-4 bg-purple-50 rounded-xl text-center border border-purple-100">
				<div class="text-2xl font-bold text-purple-600 tabular-nums">{{ stats.words }}</div>
				<div class="text-xs text-purple-500 mt-1">单词数</div>
			</div>
			<div class="p-4 bg-orange-50 rounded-xl text-center border border-orange-100">
				<div class="text-2xl font-bold text-orange-600 tabular-nums">{{ stats.chineseChars }}</div>
				<div class="text-xs text-orange-500 mt-1">中文字符</div>
			</div>
			<div class="p-4 bg-pink-50 rounded-xl text-center border border-pink-100">
				<div class="text-2xl font-bold text-pink-600 tabular-nums">{{ stats.lines }}</div>
				<div class="text-xs text-pink-500 mt-1">行数</div>
			</div>
			<div class="p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
				<div class="text-2xl font-bold text-indigo-600 tabular-nums">{{ stats.paragraphs }}</div>
				<div class="text-xs text-indigo-500 mt-1">段落数</div>
			</div>
			<div class="p-4 bg-teal-50 rounded-xl text-center border border-teal-100">
				<div class="text-2xl font-bold text-teal-600 tabular-nums">{{ stats.numbers }}</div>
				<div class="text-xs text-teal-500 mt-1">数字组数</div>
			</div>
			<div class="p-4 bg-slate-50 rounded-xl text-center border border-slate-200">
				<div class="text-2xl font-bold text-slate-600 tabular-nums">{{ stats.bytes }}</div>
				<div class="text-xs text-slate-500 mt-1">字节数 (UTF-8)</div>
			</div>
		</div>
		<div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			<div v-for="n in 8" :key="n" class="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
				<div class="text-2xl font-bold text-slate-300 tabular-nums">0</div>
				<div class="text-xs text-slate-300 mt-1">输入文本后将显示统计</div>
			</div>
		</div>
	</div>
</template>
