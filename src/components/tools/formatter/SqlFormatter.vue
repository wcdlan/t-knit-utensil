<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import { copyToClipboard } from '@/utils/clipboard';

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
	<div class="space-y-4">
		<n-input v-model:value="input" :autosize="{ minRows: 8 }" placeholder="输入 SQL 语句..." type="textarea" />

		<div class="flex gap-2">
			<n-button type="primary" @click="format"> 格式化 </n-button>
			<n-button type="info" @click="compress"> 压缩 </n-button>
		</div>

		<div v-if="output" class="relative">
			<n-input :autosize="{ minRows: 10 }" :value="output" readonly type="textarea" />
			<n-button class="absolute top-2" size="small" @click="copy"> 复制 </n-button>
		</div>
	</div>
</template>
