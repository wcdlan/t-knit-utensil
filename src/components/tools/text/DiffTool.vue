<script lang="ts" setup>
import { ref } from 'vue'

const left = ref('')
const right = ref('')
const diffResult = ref<{ type: 'same' | 'added' | 'removed'; text: string }[]>([])

function computeDiff() {
  const leftLines = left.value.split('\n')
  const rightLines = right.value.split('\n')

  // Simple LCS-based diff
  const m = leftLines.length
  const n = rightLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  let i = m,
    j = n
  const temp: { type: 'same' | 'added' | 'removed'; text: string }[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      temp.push({ type: 'same', text: leftLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: 'added', text: rightLines[j - 1] })
      j--
    } else if (i > 0) {
      temp.push({ type: 'removed', text: leftLines[i - 1] })
      i--
    }
  }

  diffResult.value = temp.reverse()
}

function clearAll() {
  left.value = ''
  right.value = ''
  diffResult.value = []
}
</script>

<template>
  <div class="space-y-4">
    <!-- Dual Textareas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">原始文本</label>
        <textarea
          v-model="left"
          class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="粘贴原始文本..."
          rows="10"
        ></textarea>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">对比文本</label>
        <textarea
          v-model="right"
          class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="粘贴对比文本..."
          rows="10"
        ></textarea>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
        @click="computeDiff"
      >
        对比
      </button>
      <button
        class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
        @click="clearAll"
      >
        清空
      </button>
    </div>

    <!-- Diff Result -->
    <div
      v-if="diffResult.length"
      class="border border-gray-200 rounded-lg overflow-hidden font-mono text-sm"
    >
      <div
        v-for="(line, i) in diffResult"
        :key="i"
        :class="{
          'bg-red-50 text-red-700': line.type === 'removed',
          'bg-green-50 text-green-700': line.type === 'added',
          'text-gray-700': line.type === 'same',
        }"
        class="px-4 py-1.5 flex items-center gap-2"
      >
        <span class="w-5 text-center flex-shrink-0 text-xs">
          {{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}
        </span>
        <span>{{ line.text || ' ' }}</span>
      </div>
    </div>
  </div>
</template>
