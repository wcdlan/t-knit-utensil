<script lang="ts" setup>
	import { ref } from 'vue';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const emit = defineEmits<{
		'file-selected': [file: File];
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) emit('file-selected', file);
	}
</script>

<template>
	<div
		class="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-12 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
		@click="fileInput?.click()"
	>
		<input ref="fileInput" accept="image/*" class="hidden" type="file" @change="handleFileSelect" />
		<div class="mb-4 text-slate-300">
			<TkuIcon :name="icons.image" :size="48" />
		</div>
		<p class="mb-1 text-lg font-medium text-gray-600">点击上传或拖拽图片到此处</p>
		<p class="text-sm text-gray-400">支持 PNG、JPG、GIF、WebP、SVG 等常见图片格式</p>
	</div>
</template>
