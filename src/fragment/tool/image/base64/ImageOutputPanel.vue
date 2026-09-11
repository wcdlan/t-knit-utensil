<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		preview: string;
		meta: string;
	}>();

	const emit = defineEmits<{
		download: [];
		reset: [];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="mb-3 flex items-center justify-between">
			<span class="text-xs font-semibold text-slate-500">转换结果</span>
			<span v-if="props.meta" class="text-[10px] text-slate-400">{{ props.meta }}</span>
		</div>
		<div
			v-if="props.preview"
			class="flex max-h-80 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-4"
		>
			<img :src="props.preview" alt="转换结果预览" class="max-h-72 max-w-full object-contain" />
		</div>
		<div v-else class="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200">
			<div class="mb-2 text-slate-300">
				<TkuIcon :name="icons.image" :size="32" />
			</div>
			<span class="text-xs text-slate-400">转换后图片将显示在这里</span>
		</div>
		<div v-if="props.preview" class="mt-3 flex items-center gap-2">
			<n-button size="small" type="primary" @click="emit('download')">下载图片</n-button>
			<n-button secondary size="small" @click="emit('reset')">清空</n-button>
		</div>
	</div>
</template>
