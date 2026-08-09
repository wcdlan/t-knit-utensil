<script lang="ts" setup>
import {ref} from 'vue'

const uuids = ref<string[]>([])
const count = ref(5)
const uppercase = ref(false)

function generateV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generate() {
  const result: string[] = []
  for (let i = 0; i < count.value; i++) {
    const uuid = generateV4()
    result.push(uppercase.value ? uuid.toUpperCase() : uuid)
  }
  uuids.value = result
}

function copyAll() {
  navigator.clipboard.writeText(uuids.value.join('\n'))
}

function copyOne(uuid: string) {
  navigator.clipboard.writeText(uuid)
}

generate()
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">生成数量:</label>
        <input
            v-model.number="count"
            class="w-20 p-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            max="100"
            min="1"
            type="number"
        />
      </div>
      <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input v-model="uppercase" class="rounded" type="checkbox"/>
        大写
      </label>
      <button class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition cursor-pointer"
              @click="generate">
        生成
      </button>
      <button v-if="uuids.length" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
              @click="copyAll">
        复制全部
      </button>
    </div>

    <div class="space-y-1">
      <div
          v-for="(uuid, i) in uuids"
          :key="i"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition"
      >
        <code class="text-sm font-mono text-gray-700">{{ uuid }}</code>
        <button
            class="px-3 py-1 bg-white border border-gray-200 rounded text-xs opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition cursor-pointer"
            @click="copyOne(uuid)"
        >复制
        </button>
      </div>
    </div>
  </div>
</template>
