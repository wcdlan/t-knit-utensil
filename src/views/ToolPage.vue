<script lang="ts" setup>
	import { computed } from 'vue';
	import { useRoute } from 'vue-router';
	import { getToolById } from '@/data/tools';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const route = useRoute();
	const toolId = computed(() => route.path.split('/').pop() || '');
	const tool = computed(() => getToolById(toolId.value));
</script>

<template>
	<div v-if="tool">
		<!-- Breadcrumb -->
		<div class="mb-6">
			<router-link
				class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors duration-200"
				to="/"
			>
				<span class="text-base">&larr;</span>
				<span>返回首页</span>
			</router-link>
		</div>

		<!-- Tool Header with gradient icon container -->
		<div class="mb-8">
			<div class="flex items-center gap-4">
				<div
					class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-sm"
				>
					<TkuIcon :name="tool.icon" :size="28" />
				</div>
				<div>
					<h1 class="text-2xl font-bold text-slate-800 tracking-tight">{{ tool.name }}</h1>
					<p class="text-slate-500 text-sm mt-0.5">{{ tool.description }}</p>
				</div>
			</div>
		</div>

		<!-- Dynamic Tool Component via nested route -->
		<div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 lg:p-8">
			<router-view v-slot="{ Component }">
				<transition mode="out-in" name="tool">
					<keep-alive>
						<component :is="Component" />
					</keep-alive>
				</transition>
			</router-view>
		</div>
	</div>

	<!-- Not found state -->
	<div v-else class="flex flex-col items-center justify-center py-24 text-center">
		<div class="mb-4 text-slate-300">
			<TkuIcon :name="icons.magnify" :size="48" />
		</div>
		<p class="text-slate-500 text-lg font-medium mb-2">工具未找到</p>
		<p class="text-slate-400 text-sm mb-6">请检查工具地址是否正确</p>
		<router-link
			class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium no-underline"
			to="/"
		>
			<span>&larr;</span> 返回首页
		</router-link>
	</div>
</template>
