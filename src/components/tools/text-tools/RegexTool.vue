<script lang="ts" setup>
import {computed, ref} from 'vue'

const pattern = ref('')
const flags = ref('g')
const testStr = ref('')
const error = ref('')

const matches = computed(() => {
  error.value = ''
  if (!pattern.value || !testStr.value) return []
  try {
    const re = new RegExp(pattern.value, flags.value)
    const results: { match: string; index: number; groups: string[] }[] = []
    let m: RegExpExecArray | null
    if (flags.value.includes('g')) {
      while ((m = re.exec(testStr.value)) !== null) {
        results.push({match: m[0], index: m.index, groups: m.slice(1)})
        if (m[0] === '') {
          re.lastIndex++;
          if (re.lastIndex > testStr.value.length) break
        }
      }
    } else {
      m = re.exec(testStr.value)
      if (m) results.push({match: m[0], index: m.index, groups: m.slice(1)})
    }
    return results
  } catch (e) {
    error.value = '正则表达式错误: ' + (e as Error).message
    return []
  }
})

const flagOptions = [
  {value: 'g', label: 'g (全局)'},
  {value: 'i', label: 'i (忽略大小写)'},
  {value: 'm', label: 'm (多行)'},
  {value: 's', label: 's (点匹配换行)'},
]
</script>

<template>
  <div class="space-y-4">
    <!-- Pattern -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 mb-1">正则表达式</label>
      <div class="flex gap-2">
        <span class="flex items-center px-3 bg-gray-100 rounded-lg text-gray-400 font-mono">/</span>
        <input
            v-model="pattern"
            class="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="输入正则表达式"
        />
        <span class="flex items-center px-3 bg-gray-100 rounded-lg text-gray-400 font-mono">/</span>
        <select
            v-model="flags"
            class="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option v-for="f in flagOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
          <option value="gi">gi</option>
          <option value="gm">gm</option>
          <option value="gim">gim</option>
          <option value="gis">gis</option>
        </select>
      </div>
    </div>

    <!-- Test String -->
    <div>
      <label class="block text-xs font-semibold text-gray-500 mb-1">测试文本</label>
      <textarea
          v-model="testStr"
          class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="输入要测试的文本..."
          rows="6"
      ></textarea>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
      {{ error }}
    </div>

    <!-- Results -->
    <div v-if="matches.length" class="space-y-2">
      <div class="text-sm text-gray-600">
        共匹配 <span class="font-semibold text-blue-600">{{ matches.length }}</span> 处
      </div>
      <div class="space-y-1">
        <div
            v-for="(m, i) in matches"
            :key="i"
            class="p-3 bg-green-50 rounded-lg text-sm font-mono flex gap-4"
        >
          <span class="text-gray-400 flex-shrink-0">[{{ i }}]</span>
          <span class="text-gray-700 font-semibold">{{ m.match }}</span>
          <span class="text-gray-400">index: {{ m.index }}</span>
          <span v-if="m.groups.length" class="text-gray-500">
            groups: {{ m.groups.join(', ') }}
          </span>
        </div>
      </div>
    </div>
    <div v-else-if="pattern && testStr && !error" class="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
      无匹配结果
    </div>
  </div>
</template>
