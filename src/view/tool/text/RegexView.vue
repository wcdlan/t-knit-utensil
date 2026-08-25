<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import type { RegexMatch } from '@/types/regex';
	import PatternInput from '@/fragment/tool/text/regex/PatternInput.vue';
	import CommonPatterns from '@/fragment/tool/text/regex/CommonPatterns.vue';
	import TestInput from '@/fragment/tool/text/regex/TestInput.vue';
	import ResultPanel from '@/fragment/tool/text/regex/ResultPanel.vue';
	import CharRefTable from '@/fragment/tool/text/regex/CharRefTable.vue';
	import AboutPanel from '@/fragment/tool/text/regex/AboutPanel.vue';

	const pattern = ref('');
	const flags = ref('g');
	const testStr = ref('');
	const error = ref('');

	const matches = computed<RegexMatch[]>(() => {
		error.value = '';
		if (!pattern.value || !testStr.value) return [];
		try {
			const re = new RegExp(pattern.value, flags.value);
			const results: RegexMatch[] = [];
			let m: RegExpExecArray | null;
			if (flags.value.includes('g')) {
				while ((m = re.exec(testStr.value)) !== null) {
					results.push({ match: m[0], index: m.index, groups: m.slice(1) });
					if (m[0] === '') {
						re.lastIndex++;
						if (re.lastIndex > testStr.value.length) break;
					}
				}
			} else {
				m = re.exec(testStr.value);
				if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1) });
			}
			return results;
		} catch (e) {
			error.value = '正则表达式错误: ' + (e as Error).message;
			return [];
		}
	});

	function selectPattern(p: string) {
		pattern.value = p;
	}
</script>

<template>
	<div class="space-y-5">
		<PatternInput v-model:flags="flags" v-model:pattern="pattern" />
		<CommonPatterns :pattern="pattern" @select="selectPattern" />
		<TestInput v-model:model-value="testStr" />
		<ResultPanel :error="error" :matches="matches" :pattern="pattern" :test-str="testStr" />
		<CharRefTable />
		<AboutPanel />
	</div>
</template>
