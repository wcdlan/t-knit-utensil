<script lang="ts" setup>
import {computed, ref} from 'vue'

const text = ref('')
const size = ref(200)
const qrUrl = computed(() => {
  if (!text.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&data=${encodeURIComponent(text.value)}`
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 mb-1">内容</label>
        <textarea
            v-model="text"
            class="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            placeholder="输入文本或网址..."
            rows="3"
        ></textarea>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">尺寸</label>
        <select
            v-model="size"
            class="p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option :value="150">150px</option>
          <option :value="200">200px</option>
          <option :value="300">300px</option>
          <option :value="400">400px</option>
        </select>
      </div>
    </div>

    <div v-if="qrUrl" class="p-4 bg-gray-50 rounded-lg inline-block">
      <img :alt="text" :height="size" :src="qrUrl" :width="size" class="block"/>
    </div>
    <div v-else class="p-8 bg-gray-50 rounded-lg text-center text-gray-400 text-sm">
      输入内容后自动生成二维码
    </div>
  </div>
</template>
