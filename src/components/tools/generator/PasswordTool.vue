<script lang="ts" setup>
import { ref } from 'vue'

const length = ref(16)
const upper = ref(true)
const lower = ref(true)
const numbers = ref(true)
const symbols = ref(true)
const passwords = ref<string[]>([])
const count = ref(5)

function generate() {
  let chars = ''
  if (lower.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (upper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (numbers.value) chars += '0123456789'
  if (symbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!chars) {
    passwords.value = ['请至少选择一种字符类型']
    return
  }

  const result: string[] = []
  for (let i = 0; i < count.value; i++) {
    let pwd = ''
    const bytes = crypto.getRandomValues(new Uint32Array(length.value))
    for (let j = 0; j < length.value; j++) {
      pwd += chars[bytes[j] % chars.length]
    }
    result.push(pwd)
  }
  passwords.value = result
}

function copyAll() {
  navigator.clipboard.writeText(passwords.value.join('\n'))
}

function copyOne(pwd: string) {
  navigator.clipboard.writeText(pwd)
}

generate()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">密码长度</label>
        <input
          v-model.number="length"
          class="w-20 p-2.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          max="128"
          min="4"
          type="number"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-500 mb-1">生成数量</label>
        <input
          v-model.number="count"
          class="w-20 p-2.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          max="50"
          min="1"
          type="number"
        />
      </div>
    </div>

    <div class="flex flex-wrap gap-4">
      <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input v-model="upper" class="rounded" type="checkbox" /> A-Z
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input v-model="lower" class="rounded" type="checkbox" /> a-z
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input v-model="numbers" class="rounded" type="checkbox" /> 0-9
      </label>
      <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input v-model="symbols" class="rounded" type="checkbox" /> !@#$
      </label>
    </div>

    <div class="flex gap-2">
      <button
        class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
        @click="generate"
      >
        生成
      </button>
      <button
        v-if="passwords.length"
        class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
        @click="copyAll"
      >
        复制全部
      </button>
    </div>

    <div class="space-y-1">
      <div
        v-for="(pwd, i) in passwords"
        :key="i"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
      >
        <code class="text-sm font-mono text-gray-700">{{ pwd }}</code>
        <button
          class="px-3 py-1 bg-white border border-gray-200 rounded text-xs opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition cursor-pointer"
          @click="copyOne(pwd)"
        >
          复制
        </button>
      </div>
    </div>
  </div>
</template>
