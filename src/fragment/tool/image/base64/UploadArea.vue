<script lang="ts" setup>
	import { ref } from 'vue';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const emit = defineEmits<{
		'file-selected': [file: File];
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);
	const isDragging = ref(false);

	function handleFile(file: File | undefined | null) {
		if (file) emit('file-selected', file);
	}

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		handleFile(input.files?.[0]);
	}

	function onDrop(e: DragEvent) {
		isDragging.value = false;
		handleFile(e.dataTransfer?.files?.[0]);
	}
</script>

<template>
	<div
		:class="isDragging ? 'border-blue-400 bg-blue-50/60' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'"
		class="relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition"
		@click="fileInput?.click()"
		@dragenter.prevent="isDragging = true"
		@dragover.prevent="isDragging = true"
		@dragleave.prevent="isDragging = false"
		@drop.prevent="onDrop"
	>
		<input ref="fileInput" accept="image/*" class="hidden" type="file" @change="handleChange" />
		<div class="mb-4 text-slate-300">
			<TkuIcon :name="icons.image" :size="48" />
		</div>
		<p class="mb-1 text-lg font-medium text-gray-600">点击上传或拖拽图片到此处</p>
		<p class="text-sm text-gray-400">支持 PNG、JPG、GIF、WebP、SVG 等常见图片格式</p>
	</div>
</template>
