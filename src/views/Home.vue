<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NEmpty, NInput } from 'naive-ui';
	import { toolGroups } from '@/data/tools';

	const query = ref('');
	const collapsed = ref<Record<string, boolean>>({});

	const toolCount = computed(() => toolGroups.reduce((sum, g) => sum + g.tools.length, 0));

	const filteredGroups = computed(() => {
		if (!query.value.trim()) return toolGroups;
		const q = query.value.toLowerCase();
		return toolGroups
			.map((g) => ({
				...g,
				tools: g.tools.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
			}))
			.filter((g) => g.tools.length > 0);
	});

	function toggle(id: string) {
		collapsed.value[id] = !collapsed.value[id];
	}
</script>

<template>
	<div>
		<!-- Hero section -->
		<div class="mb-8">
			<div class="flex flex-col items-center text-center py-8">
				<div class="text-5xl mb-4">🛠️</div>
				<h1 class="text-3xl font-bold text-slate-800 mb-2 tracking-tight">T Knit Utensil</h1>
				<p class="text-slate-500 max-w-md leading-relaxed">
					面向开发者的在线工具集，{{ toolCount }} 个实用工具，覆盖编解码、格式化、生成、转换等常用场景
				</p>
			</div>
		</div>

		<!-- Search -->
		<div class="mb-8 max-w-lg mx-auto">
			<n-input
				v-model:value="query"
				class="search-input"
				clearable
				placeholder="搜索 {{ toolCount }} 个工具..."
				size="large"
			>
				<template #prefix>
					<span class="text-slate-400 text-lg">🔍</span>
				</template>
			</n-input>
		</div>

		<n-empty v-if="filteredGroups.length === 0" class="py-16" description="未找到匹配的工具" />

		<div v-for="group in filteredGroups" :key="group.id" class="mb-6">
			<!-- Group header -->
			<div class="flex items-center gap-2 mb-3 cursor-pointer select-none group" @click="toggle(group.id)">
				<span
					:class="{ 'rotate-90': !collapsed[group.id] }"
					class="text-[10px] text-slate-400 transition-transform duration-200 group-hover:text-slate-600"
					>&#9654;</span
				>
				<span
					class="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors"
				>
					{{ group.name }}
				</span>
				<span class="text-[10px] font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
					{{ group.tools.length }}
				</span>
			</div>

			<!-- Tool cards grid -->
			<div
				v-show="!collapsed[group.id]"
				class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
			>
				<router-link
					v-for="tool in group.tools"
					:key="tool.id"
					:title="tool.description"
					:to="`/tool/${tool.id}`"
					class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/card"
				>
					<span class="text-2xl transition-transform duration-200 group-hover/card:scale-110">
						{{ tool.icon }}
					</span>
					<span class="text-sm font-medium text-slate-700 text-center leading-tight">
						{{ tool.name }}
					</span>
				</router-link>
			</div>
		</div>
	</div>
</template>
