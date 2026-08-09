<script lang="ts" setup>
import {computed, ref} from 'vue'
import {toolGroups} from '../data/tools'

const query = ref('')
const collapsed = ref<Record<string, boolean>>({})

const filteredGroups = computed(() => {
  if (!query.value.trim()) return toolGroups
  const q = query.value.toLowerCase()
  return toolGroups
      .map((g) => ({
        ...g,
        tools: g.tools.filter(
            (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.tools.length > 0)
})

function toggle(id: string) {
  collapsed.value[id] = !collapsed.value[id]
}
</script>

<template>
  <div>
    <!-- Search -->
    <div class="mb-4">
      <input
          v-model="query"
          class="w-full max-w-[320px] p-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700"
          placeholder="搜索工具..."
          type="text"
      />
    </div>

    <div v-if="filteredGroups.length === 0" class="text-center py-16 text-sm text-gray-400">
      未找到匹配的工具
    </div>

    <div
        v-for="group in filteredGroups"
        :key="group.id"
        class="mb-5"
    >
      <div
          class="flex items-center gap-1.5 mb-2 cursor-pointer select-none"
          @click="toggle(group.id)"
      >
        <span :class="{ 'rotate-90': !collapsed[group.id] }" class="text-[10px] text-gray-400 transition-transform">&#9654;</span>
        <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ group.name }}</span>
        <span class="text-[10px] text-gray-400 ml-1">{{ group.tools.length }}</span>
      </div>

      <div
          v-show="!collapsed[group.id]"
          class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5"
      >
        <router-link
            v-for="tool in group.tools"
            :key="tool.id"
            :to="`/tool/${tool.id}`"
            :title="tool.description"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition cursor-pointer truncate bg-white"
        >
          <span class="text-sm flex-shrink-0">{{ tool.icon }}</span>
          <span class="truncate">{{ tool.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
