<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import type { DiffLine, DiffStats } from '@/types/diff';
	import InputPanel from '@/fragment/tool/text/diff/InputPanel.vue';
	import ActionBar from '@/fragment/tool/text/diff/ActionBar.vue';
	import StatsSummary from '@/fragment/tool/text/diff/StatsSummary.vue';
	import ResultPanel from '@/fragment/tool/text/diff/ResultPanel.vue';
	import AboutPanel from '@/fragment/tool/text/diff/AboutPanel.vue';

	const left = ref('');
	const right = ref('');
	const diffResult = ref<DiffLine[]>([]);

	const diffStats = computed<DiffStats | null>(() => {
		if (!diffResult.value.length) return null;
		const added = diffResult.value.filter((l) => l.type === 'added').length;
		const removed = diffResult.value.filter((l) => l.type === 'removed').length;
		const same = diffResult.value.filter((l) => l.type === 'same').length;
		return { added, removed, same };
	});

	function computeDiff() {
		const leftLines = left.value.split('\n');
		const rightLines = right.value.split('\n');

		const m = leftLines.length;
		const n = rightLines.length;
		const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (leftLines[i - 1] === rightLines[j - 1]) {
					dp[i][j] = dp[i - 1][j - 1] + 1;
				} else {
					dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
				}
			}
		}

		let i = m,
			j = n;
		const temp: DiffLine[] = [];

		while (i > 0 || j > 0) {
			if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
				temp.push({ type: 'same', text: leftLines[i - 1] });
				i--;
				j--;
			} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
				temp.push({ type: 'added', text: rightLines[j - 1] });
				j--;
			} else if (i > 0) {
				temp.push({ type: 'removed', text: leftLines[i - 1] });
				i--;
			}
		}

		diffResult.value = temp.reverse();
	}

	function clearAll() {
		left.value = '';
		right.value = '';
		diffResult.value = [];
	}
</script>

<template>
	<div class="space-y-6">
		<InputPanel v-model:left="left" v-model:right="right" />
		<ActionBar @clear="clearAll" @compare="computeDiff" />
		<StatsSummary :stats="diffStats" />
		<ResultPanel :lines="diffResult" />
		<AboutPanel />
	</div>
</template>
