<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const left = ref('');
	const right = ref('');
	const diffResult = ref<{ type: 'same' | 'added' | 'removed'; text: string }[]>([]);

	const diffStats = computed(() => {
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
		const temp: { type: 'same' | 'added' | 'removed'; text: string }[] = [];

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
		<!-- Input grids -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<div>
				<div class="flex items-center justify-between mb-2">
					<label class="text-xs font-semibold text-slate-500">原始文本</label>
					<span class="text-[10px] text-slate-400">{{ left.length }} 字符</span>
				</div>
				<n-input v-model:value="left" :autosize="{ minRows: 10 }" placeholder="粘贴原始文本..." type="textarea" />
			</div>
			<div>
				<div class="flex items-center justify-between mb-2">
					<label class="text-xs font-semibold text-slate-500">对比文本</label>
					<span class="text-[10px] text-slate-400">{{ right.length }} 字符</span>
				</div>
				<n-input v-model:value="right" :autosize="{ minRows: 10 }" placeholder="粘贴对比文本..." type="textarea" />
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-2">
			<n-button type="primary" @click="computeDiff">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.magnify" :size="16" />
					<span>对比</span>
				</span>
			</n-button>
			<n-button secondary @click="clearAll">清空</n-button>
		</div>

		<!-- Diff stats summary -->
		<div v-if="diffStats" class="flex items-center gap-4 text-sm">
			<span class="flex items-center gap-1.5">
				<span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
				<span class="text-slate-600">{{ diffStats.same }} 行未变</span>
			</span>
			<span class="flex items-center gap-1.5">
				<span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
				<span class="text-slate-600">{{ diffStats.added }} 行新增</span>
			</span>
			<span class="flex items-center gap-1.5">
				<span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
				<span class="text-slate-600">{{ diffStats.removed }} 行删除</span>
			</span>
		</div>

		<!-- Diff result -->
		<div
			v-if="diffResult.length"
			class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-mono text-sm"
		>
			<div
				v-for="(line, i) in diffResult"
				:key="i"
				:class="{
					'bg-red-50 text-red-700 border-l-3 border-red-300': line.type === 'removed',
					'bg-emerald-50 text-emerald-700 border-l-3 border-emerald-300': line.type === 'added',
					'text-slate-700': line.type === 'same'
				}"
				class="px-4 py-1.5 flex items-center gap-2"
			>
				<span class="w-5 text-center flex-shrink-0 text-xs font-medium">
					{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}
				</span>
				<span>{{ line.text || ' ' }}</span>
			</div>
		</div>
	</div>
</template>
