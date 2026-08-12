<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

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
			<n-input
				v-model:value="input"
				:autosize="{ minRows: 8, maxRows: 20 }"
				placeholder="输入 SQL 语句..."
				type="textarea"
			/>
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
		<div v-if="output">
			<div class="flex items-center justify-between mb-2">
				<label class="text-xs font-semibold text-slate-500">输出结果</label>
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-[10px] text-slate-400">{{ output.length }} 字符</span>
					<n-button secondary size="tiny" @click="copy">复制</n-button>
				</div>
			</div>
			<n-input :autosize="{ minRows: 10, maxRows: 24 }" :value="output" readonly type="textarea" />
		</div>

		<!-- Empty state -->
		<div v-if="!input && !output" class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-3 text-slate-300">
				<TkuIcon :name="icons.clipboard" :size="36" />
			</div>
			<p class="text-slate-400 text-sm">输入 SQL 语句后选择操作</p>
		</div>
	</div>
</template>
