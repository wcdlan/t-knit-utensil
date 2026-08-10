<script lang="ts" setup>
import { computed, ref } from 'vue'

const text = ref('')

const stats = computed(() => {
  const content = text.value
  if (!content) {
    return { chars: 0, charsNoSpace: 0, words: 0, lines: 0, paragraphs: 0, bytes: 0 }
  }

  const chars = content.length
  const charsNoSpace = content.replace(/\s/g, '').length
  const words = content.trim() ? content.trim().split(/\s+/).length : 0
  const lines = content.split(/\r?\n/).length
  const paragraphs = content
    .replace(/\n$/, '')
    .split(/\n\s*\n/)
    .filter((p) => p.trim()).length
  const bytes = new TextEncoder().encode(content).length

  const chineseChars = (content.match(/[一-鿿]/g) || []).length
  const numbers = (content.match(/\d+/g) || []).length

  return { chars, charsNoSpace, words, lines, paragraphs, bytes, chineseChars, numbers }
})
</script>

<template>
  <div class="space-y-4">
    <textarea
      v-model="text"
      class="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
      placeholder="输入或粘贴文本..."
      rows="10"
    ></textarea>

    <div v-if="text" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3 bg-blue-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.chars }}</div>
        <div class="text-xs text-blue-500 mt-1">总字符数</div>
      </div>
      <div class="p-3 bg-green-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.charsNoSpace }}</div>
        <div class="text-xs text-green-500 mt-1">字符数(无空格)</div>
      </div>
      <div class="p-3 bg-purple-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-purple-600">{{ stats.words }}</div>
        <div class="text-xs text-purple-500 mt-1">单词数</div>
      </div>
      <div class="p-3 bg-orange-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-orange-600">{{ stats.chineseChars }}</div>
        <div class="text-xs text-orange-500 mt-1">中文字符</div>
      </div>
      <div class="p-3 bg-pink-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-pink-600">{{ stats.lines }}</div>
        <div class="text-xs text-pink-500 mt-1">行数</div>
      </div>
      <div class="p-3 bg-indigo-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-indigo-600">{{ stats.paragraphs }}</div>
        <div class="text-xs text-indigo-500 mt-1">段落数</div>
      </div>
      <div class="p-3 bg-teal-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-teal-600">{{ stats.numbers }}</div>
        <div class="text-xs text-teal-500 mt-1">数字组数</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg text-center">
        <div class="text-2xl font-bold text-gray-600">{{ stats.bytes }}</div>
        <div class="text-xs text-gray-500 mt-1">字节数 (UTF-8)</div>
      </div>
    </div>
  </div>
</template>
