<script lang="ts" setup>
	import { computed } from 'vue';
	import type { CronPreset } from '@/types/cron';

	const props = defineProps<{
		/** 常用表达式库，用于「快速上手示例」表格 */
		presets: CronPreset[];
		/** 示例表格中要展示的表达式 */
		exampleExpressions: string[];
	}>();

	const emit = defineEmits<{
		/** 载入示例表达式到解析页签 */
		load: [expression: string];
	}>();

	/** 从常用表达式库中挑出示例条目（保持 presets 中的原始顺序） */
	const examples = computed(() => props.presets.filter((item) => props.exampleExpressions.includes(item.expression)));
</script>

<template>
	<div class="space-y-4">
		<!-- 语法速查：字段结构 -->
		<div class="rounded-xl border border-slate-100 bg-white p-5">
			<h3 class="mb-1 text-sm font-semibold text-slate-700">字段结构</h3>
			<p class="mb-3 text-xs text-slate-400">
				字段之间用<strong>空格</strong>分隔，段数决定含义：5 段从「分钟」开始，6 段从「秒」开始，7 段末尾追加「年」。
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead>
						<tr class="text-slate-400">
							<th class="pt-1 pr-4 pb-2 font-medium">段位</th>
							<th class="pt-1 pr-4 pb-2 font-medium">字段</th>
							<th class="pt-1 pr-4 pb-2 font-medium">取值范围</th>
							<th class="pt-1 pb-2 font-medium">可用的特殊字符</th>
						</tr>
					</thead>
					<tbody class="text-slate-600">
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">1（可省略）</td>
							<td class="py-2 pr-4">秒</td>
							<td class="py-2 pr-4 font-mono">0-59</td>
							<td class="py-2 font-mono">* , - /</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">1 / 2</td>
							<td class="py-2 pr-4">分钟</td>
							<td class="py-2 pr-4 font-mono">0-59</td>
							<td class="py-2 font-mono">* , - /</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">2 / 3</td>
							<td class="py-2 pr-4">小时</td>
							<td class="py-2 pr-4 font-mono">0-23</td>
							<td class="py-2 font-mono">* , - /</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">3 / 4</td>
							<td class="py-2 pr-4">日</td>
							<td class="py-2 pr-4 font-mono">1-31</td>
							<td class="py-2 font-mono break-all">* , - / ? L W</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">4 / 5</td>
							<td class="py-2 pr-4">月</td>
							<td class="py-2 pr-4 font-mono">1-12</td>
							<td class="py-2 font-mono break-all">* , - / JAN-DEC</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">5 / 6</td>
							<td class="py-2 pr-4">星期</td>
							<td class="py-2 pr-4 font-mono whitespace-nowrap">0-7（0 与 7 为周日）</td>
							<td class="py-2 font-mono break-all">* , - / ? L # SUN-SAT</td>
						</tr>
						<tr class="border-t border-slate-100">
							<td class="py-2 pr-4 font-mono whitespace-nowrap text-slate-400">7</td>
							<td class="py-2 pr-4">年</td>
							<td class="py-2 pr-4 font-mono">1970-2199</td>
							<td class="py-2 font-mono">* , - /</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- 特殊字符含义 + 易错点提醒 -->
		<div class="grid gap-4 lg:grid-cols-2">
			<div class="rounded-xl border border-slate-100 bg-white p-5">
				<h3 class="mb-3 text-sm font-semibold text-slate-700">特殊字符含义</h3>
				<ul class="space-y-1.5 text-xs leading-relaxed text-slate-600">
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">*</code>
						<span>任意值，表示「每」；出现在秒位即每秒</span>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">?</code>
						<span>不指定（Quartz 的日 / 星期占位，与 <code class="font-mono">*</code> 等效）</span>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">,</code>
						<span>列表，如 <code class="font-mono">1,15</code>、<code class="font-mono">MON,WED,FRI</code></span>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">-</code>
						<span>区间，如 <code class="font-mono">1-5</code>、<code class="font-mono">9-18</code></span>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">/</code>
						<span
							>步长，如 <code class="font-mono">*&#47;5</code>（每 5 个单位）、<code class="font-mono">0/15</code>（从 0
							起每 15）</span
						>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">L</code>
						<span>最后一天（日位）或最后一个星期几（周位 <code class="font-mono">5L</code>）</span>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">W</code>
						<span
							>最近的工作日，如 <code class="font-mono">15W</code>、<code class="font-mono">LW</code
							>（当月最后一个工作日）</span
						>
					</li>
					<li class="flex gap-2">
						<code class="shrink-0 font-mono text-blue-700">#</code>
						<span>第 n 个星期几，如 <code class="font-mono">5#2</code> 表示当月第二个周五</span>
					</li>
				</ul>
			</div>

			<div class="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
				<h3 class="mb-3 text-sm font-semibold text-amber-800">易错点提醒</h3>
				<ul class="space-y-2 text-xs leading-relaxed text-amber-900/80">
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span>
							日与星期<strong>同时被限定</strong>时，满足<strong>任意一个</strong>即执行（OR 语义），而不是同时满足
						</span>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span>星期中 <code class="font-mono">0</code> 与 <code class="font-mono">7</code> 都表示周日</span>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span>6 段式默认第一位是<strong>秒</strong>，不是分；别名写法不能与字段混用</span>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span
							><code class="font-mono">L</code> / <code class="font-mono">W</code> /
							<code class="font-mono">#</code> 属于 Quartz 扩展，普通 crond 不支持</span
						>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span
							>步长不会「对齐到整点」：<code class="font-mono">*&#47;7</code> 是 0、7、14… 而非每 7
							分钟从当前时刻起算</span
						>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span>「2 月 31 日」这类不存在的日期永远不会触发，解析页签会明确提示</span>
					</li>
					<li class="flex gap-2">
						<span class="shrink-0">·</span>
						<span>Linux crontab 的「日」字段不支持 <code class="font-mono">?</code>，Quartz 才支持</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- 快速上手示例：从常用表达式库中挑选，点击可载入解析 -->
		<div class="rounded-xl border border-slate-100 bg-white p-5">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 class="text-sm font-semibold text-slate-700">快速上手示例</h3>
				<span class="text-[10px] text-slate-400">点击任意一行可载入到解析页签</span>
			</div>
			<div class="space-y-1.5">
				<div
					v-for="preset in examples"
					:key="preset.expression"
					class="group flex cursor-pointer flex-col gap-1 rounded-lg border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:gap-4"
					@click="emit('load', preset.expression)"
				>
					<div class="shrink-0 sm:w-64">
						<div class="text-xs font-medium text-slate-700">{{ preset.name }}</div>
						<div class="mt-0.5 text-[10px] leading-snug text-slate-400">{{ preset.description }}</div>
					</div>
					<div class="min-w-0 flex-1 font-mono text-sm text-blue-700">{{ preset.expression }}</div>
					<span class="shrink-0 text-[10px] text-slate-300 transition group-hover:text-blue-400">点击载入</span>
				</div>
			</div>
		</div>
	</div>
</template>
