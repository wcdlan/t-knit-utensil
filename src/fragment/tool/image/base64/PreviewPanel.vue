<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		src: string;
		meta: string;
	}>();

	const emit = defineEmits<{
		copy: [];
		download: [];
	}>();
</script>

<template>
	<!-- PreviewPanel：图片预览区（随面板撑满剩余高度，图片等比缩放居中） -->
	<div class="flex min-h-0 flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="mb-3 flex flex-shrink-0 items-center justify-between">
			<span class="text-xs font-semibold text-slate-500">图片预览</span>
			<span v-if="meta" class="text-[10px] text-slate-400">{{ meta }}</span>
		</div>
		<div
			v-if="src"
			class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-4"
		>
			<img :src="src" alt="图片预览" class="max-h-full max-w-full object-contain" />
		</div>
		<div
			v-else
			class="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200"
		>
			<div class="mb-2 text-slate-300">
				<TkuIcon :name="icons.image" :size="32" />
			</div>
			<span class="text-xs text-slate-400">暂无可预览的图片</span>
		</div>
	</div>
</template>
