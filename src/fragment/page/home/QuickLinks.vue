<script lang="ts" setup>
	import { NTooltip } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { QuickLink } from '@/types/site';

	defineProps<{
		quickLinks: QuickLink[];
	}>();
</script>

<template>
	<!-- 快捷链接：站点配置的右上角图标链接组 -->
	<div v-if="quickLinks.length" class="absolute right-4 top-4 z-10 flex items-center gap-1.5">
		<n-tooltip v-for="link in quickLinks" :key="link.url">
			<template #trigger>
				<a
					:href="link.url"
					:rel="link.newTab ? 'noopener noreferrer' : undefined"
					:target="link.newTab ? '_blank' : '_self'"
					class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-500"
				>
					<TkuIcon :name="link.icon" :size="18" />
				</a>
			</template>
			{{ link.name || link.url }}
		</n-tooltip>
	</div>
</template>
