<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NEmpty, NSpin } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { VirtioVersion } from '@/types/virtio';

	defineProps<{
		versions: VirtioVersion[];
		selected: string | null;
		loading: boolean;
		hasMore: boolean;
		totalCount: number;
	}>();

	const emit = defineEmits<{
		select: [version: string];
		'sentinel-change': [el: HTMLDivElement | null];
	}>();

	/** 滚动加载哨兵元素（版本列表渲染完成后才存在），变化时上报给父级以搭建滚动加载观察 */
	const sentinelEl = ref<HTMLDivElement | null>(null);
	watch(sentinelEl, (el) => emit('sentinel-change', el));
</script>

<template>
	<div
		class="h-[50vh] overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-3 lg:col-span-1 lg:h-[calc(100vh-260px)]"
	>
		<div v-if="loading" class="flex items-center justify-center py-16">
			<n-spin size="medium" />
		</div>

		<div v-else-if="versions.length === 0" class="py-8">
			<n-empty description="暂无可用版本" />
		</div>

		<div v-else class="space-y-2">
			<div
				v-for="v in versions"
				:key="v.name"
				:class="
					selected === v.name
						? 'border-blue-400 bg-blue-50/70 ring-1 ring-blue-200'
						: 'border-transparent hover:border-slate-200 hover:bg-slate-50'
				"
				class="flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-all duration-200"
				@click="emit('select', v.name)"
			>
				<div class="min-w-0">
					<div :class="selected === v.name ? 'text-blue-700' : 'text-slate-700'" class="truncate text-sm font-medium">
						{{ v.name }}
					</div>
					<div class="mt-0.5 text-[11px] text-slate-400">{{ v.date }}</div>
				</div>
				<TkuIcon v-if="selected === v.name" :name="icons.check" :size="16" class="flex-shrink-0 text-blue-500" />
			</div>

			<!-- 滚动加载哨兵 + 底部状态 -->
			<div ref="sentinelEl" class="flex h-10 items-center justify-center py-4">
				<span v-if="hasMore" class="text-xs text-slate-400">
					<TkuIcon :name="icons.chevronDown" :size="14" class="mr-1 inline animate-bounce" />
					向下滚动加载更多
				</span>
				<span v-else class="text-[11px] text-slate-400">已加载全部 {{ totalCount }} 个版本</span>
			</div>
		</div>
	</div>
</template>
