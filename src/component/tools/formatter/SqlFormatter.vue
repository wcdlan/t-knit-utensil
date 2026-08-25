<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const input = ref('');
	const output = ref('');

	function format() {
		let sql = input.value.trim();
		if (!sql) return;

		const keywords = [
			'SELECT',
			'FROM',
			'WHERE',
			'AND',
			'OR',
			'ORDER BY',
			'GROUP BY',
			'HAVING',
			'INSERT INTO',
			'VALUES',
			'UPDATE',
			'SET',
			'DELETE FROM',
			'CREATE TABLE',
			'ALTER TABLE',
			'DROP TABLE',
			'JOIN',
			'LEFT JOIN',
			'RIGHT JOIN',
			'INNER JOIN',
			'OUTER JOIN',
			'ON',
			'AS',
			'IN',
			'NOT IN',
			'IS NULL',
			'IS NOT NULL',
			'LIKE',
			'BETWEEN',
			'LIMIT',
			'OFFSET',
			'UNION',
			'UNION ALL',
			'DISTINCT',
			'COUNT',
			'SUM',
			'AVG',
			'MAX',
			'MIN',
			'CASE',
			'WHEN',
			'THEN',
			'ELSE',
			'END',
			'ASC',
			'DESC',
			'NULLS FIRST',
			'NULLS LAST',
			'WITH',
			'RECURSIVE',
			'RETURNING',
			'IF',
			'EXISTS',
			'NOT EXISTS'
		];

		sql = sql.replace(/\s+/g, ' ');

		for (const kw of keywords) {
			const re = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
			sql = sql.replace(re, kw);
		}

		const majorClauses = [
			'SELECT',
			'FROM',
			'WHERE',
			'ORDER BY',
			'GROUP BY',
			'HAVING',
			'LIMIT',
			'OFFSET',
			'UNION',
			'INSERT INTO',
			'VALUES',
			'UPDATE',
			'SET',
			'DELETE FROM',
			'CREATE TABLE',
			'ALTER TABLE',
			'DROP TABLE',
			'RETURNING',
			'WITH'
		];

		for (const clause of majorClauses) {
			const re = new RegExp('\\b(' + clause.replace(/ /g, '\\s+') + ')\\b', 'g');
			sql = sql.replace(re, '\n$1');
		}

		sql = sql.replace(/^\n/, '');

		const lines = sql.split('\n');
		const formatted = lines
			.map((line, i) => {
				const trimmed = line.trim();
				if (i === 0) return trimmed;
				const isMajor = majorClauses.some((c) => trimmed.startsWith(c));
				return isMajor ? trimmed : '  ' + trimmed;
			})
			.join('\n');

		output.value = formatted;
	}

	function compress() {
		output.value = input.value.replace(/\s+/g, ' ').trim();
	}

	function copy() {
		copyToClipboard(output.value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Input section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">SQL 输入</label>
				<span class="text-[10px] text-slate-400">{{ input.length }} 字符</span>
			</div>
			<div class="relative">
				<n-input
					v-model:value="input"
					:autosize="{ minRows: 8, maxRows: 20 }"
					placeholder="输入 SQL 语句..."
					type="textarea"
				/>
				<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
				<div
					v-if="!input"
					class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
				>
					<div class="mb-2 text-slate-300">
						<TkuIcon :name="icons.clipboard" :size="28" />
					</div>
					<p class="text-slate-400 text-xs">输入 SQL 语句后选择操作</p>
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="flex flex-wrap items-center gap-2">
			<n-button type="primary" @click="format">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.star" :size="16" />
					<span>格式化</span>
				</span>
			</n-button>
			<n-button type="info" @click="compress">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.package" :size="16" />
					<span>压缩</span>
				</span>
			</n-button>
		</div>

		<!-- Output section -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button :disabled="!output" secondary size="tiny" @click="copy">复制</n-button>
				</div>
			</div>
			<div class="relative">
				<n-input
					:autosize="{ minRows: 10, maxRows: 24 }"
					:value="output"
					class="cursor-pointer"
					readonly
					type="textarea"
					@click="copy"
				/>
				<div v-if="!output" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
					<span class="text-slate-300 text-xs">输入 SQL 语句后选择操作</span>
				</div>
			</div>
		</div>

		<!-- About SQL formatting -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">为什么需要格式化 SQL？</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				手写或从日志抓取的 SQL 往往挤在一行、大小写混乱。格式化会将
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">SELECT</code>、
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">FROM</code>、
				<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">WHERE</code>
				等关键字换行对齐、统一关键字大小写、对条件子句做两级缩进，让语句结构一目了然。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				压缩操作会移除多余空白，把整条语句压成一行，适合贴进脚本或作为参数传递，减小日志与请求体积。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				常见应用场景：复盘线上慢查询日志、解读 ORM 生成的 SQL、以及把多行 SQL 压缩后写入配置文件。
			</p>
		</div>
	</div>
</template>
