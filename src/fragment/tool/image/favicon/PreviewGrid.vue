<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { FaviconSize } from '@/types/image';

	defineProps<{
		sizes: FaviconSize[];
		favicons: Map<number, string>;
		png: boolean;
		ico: boolean;
		canDownloadZip: boolean;
	}>();

	const emit = defineEmits<{
		'download-zip': [];
		'download-single': [size: number, format: 'png' | 'ico'];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<p class="text-sm font-medium text-gray-500">预览</p>
			<n-button v-if="canDownloadZip" type="primary" @click="emit('download-zip')">
				<span class="flex items-center gap-1.5"
					><TkuIcon :name="icons.package" :size="16" /><span>打包下载 ZIP</span></span
				>
			</n-button>
		</div>
		<div class="flex flex-wrap gap-4">
			<div v-for="s in sizes" v-show="s.selected" :key="s.size" class="flex flex-col items-center gap-2">
				<div
					:class="{ 'ring-2 ring-blue-300': favicons.has(s.size) }"
					:style="{
						width: Math.min(s.size, 128) + 'px',
						height: Math.min(s.size, 128) + 'px'
					}"
					class="flex items-center justify-center overflow-hidden rounded-sm border border-gray-200 bg-gray-50"
				>
					<img
						v-if="favicons.get(s.size)"
						:src="favicons.get(s.size)!"
						:style="{
							width: '100%',
							height: '100%',
							imageRendering: s.size <= 32 ? 'pixelated' : 'auto'
						}"
						alt=""
					/>
					<span v-else class="text-xs text-gray-400">生成中...</span>
				</div>
				<span class="text-xs text-gray-500">{{ s.label }}</span>
				<div v-if="favicons.get(s.size)" class="flex gap-1.5">
					<n-button v-if="png" size="tiny" @click="emit('download-single', s.size, 'png')"> ↓ PNG </n-button>
					<n-button v-if="ico" size="tiny" @click="emit('download-single', s.size, 'ico')"> ↓ ICO </n-button>
				</div>
			</div>
		</div>
	</div>
</template>
