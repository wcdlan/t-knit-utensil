<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

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
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">对比结果</label>
			</div>
			<div
				v-if="diffResult.length"
				class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto font-mono text-sm"
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
					<span class="whitespace-pre-wrap break-words">{{ line.text || ' ' }}</span>
				</div>
			</div>
			<div v-else class="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
				<span class="text-slate-300 text-sm">输入文本后点击「对比」查看差异</span>
			</div>
		</div>

		<!-- About diff -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">关于文本对比</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				文本对比工具通过<span class="font-medium text-blue-800">最长公共子序列（LCS）</span>算法，
				计算两段文本逐行的差异——绿色标记新增行，红色标记删除行，白色为未变行。这是 Git
				等版本控制系统中最核心的差异比较算法。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				常见应用场景：对比代码修改前后的差异、校验配置文件版本变更、检查翻译文本是否完整、以及审查文档的增删改动。
				本工具纯前端计算，文本内容不会上传至任何服务器。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				需要注意的是：本工具采用<span class="font-medium text-blue-800">行级</span>对比（按换行符拆分），
				适合结构化文本（代码、配置文件等）。对于纯段落级的长文本，建议先按行整理再进行比较。
			</p>
		</div>
	</div>
</template>
