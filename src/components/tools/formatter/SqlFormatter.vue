<script lang="ts" setup>
import { ref } from 'vue'

const input = ref('')
const output = ref('')

function format() {
  let sql = input.value.trim()
  if (!sql) return

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
    'NOT EXISTS',
  ]

  // Normalize whitespace
  sql = sql.replace(/\s+/g, ' ')

  // Add newlines before major clauses
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
    'WITH',
  ]

  // Uppercase keywords
  for (const kw of keywords) {
    const re = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi')
    sql = sql.replace(re, kw)
  }

  // Add line breaks before major clauses
  for (const clause of majorClauses) {
    const re = new RegExp('\\b(' + clause.replace(/ /g, '\\s+') + ')\\b', 'g')
    sql = sql.replace(re, '\n$1')
  }

  // Clean up leading newline
  sql = sql.replace(/^\n/, '')

  // Indent lines
  const lines = sql.split('\n')
  const formatted = lines
    .map((line, i) => {
      const trimmed = line.trim()
      if (i === 0) return trimmed
      const isMajor = majorClauses.some((c) => trimmed.startsWith(c))
      return isMajor ? trimmed : '  ' + trimmed
    })
    .join('\n')

  output.value = formatted
}

function compress() {
  output.value = input.value.replace(/\s+/g, ' ').trim()
}

function copy() {
  navigator.clipboard.writeText(output.value)
}
</script>

<template>
  <div class="space-y-4">
    <textarea
      v-model="input"
      class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
      placeholder="输入 SQL 语句..."
      rows="8"
    ></textarea>
    <div class="flex gap-2">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
        @click="format"
      >
        格式化
      </button>
      <button
        class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition cursor-pointer"
        @click="compress"
      >
        压缩
      </button>
    </div>
    <div v-if="output" class="relative">
      <textarea
        :value="output"
        class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 resize-y"
        readonly
        rows="10"
      ></textarea>
      <button
        class="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50 transition cursor-pointer"
        @click="copy"
      >
        复制
      </button>
    </div>
  </div>
</template>
