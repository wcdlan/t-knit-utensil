<script lang="ts" setup>
import {toolGroups} from '../data/tools'

function scrollToGroup(id: string) {
  document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'})
}
</script>

<template>
  <div>
    <!-- Hero -->
    <div class="text-center py-12 md:py-20">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
        T-Utils 在线工具站
      </h1>
      <p class="text-lg text-gray-500 max-w-lg mx-auto mb-8">
        开发者常用的在线工具集合，无需安装，即开即用
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        <button
            v-for="group in toolGroups"
            :key="group.id"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition cursor-pointer"
            @click="scrollToGroup(group.id)"
        >
          <span>{{ group.icon }}</span>
          {{ group.name }}
        </button>
      </div>
    </div>

    <!-- Tool Groups -->
    <div v-for="group in toolGroups" :id="group.id" :key="group.id" class="mb-12 scroll-mt-20">
      <div class="flex items-center gap-3 mb-5">
        <span class="text-2xl">{{ group.icon }}</span>
        <h2 class="text-2xl font-bold text-gray-800">{{ group.name }}</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
            v-for="tool in group.tools"
            :key="tool.id"
            :to="`/tool/${tool.id}`"
            class="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
        >
          <div class="flex items-start gap-3">
            <span class="text-2xl flex-shrink-0">{{ tool.icon }}</span>
            <div>
              <h3 class="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {{ tool.name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">{{ tool.description }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
