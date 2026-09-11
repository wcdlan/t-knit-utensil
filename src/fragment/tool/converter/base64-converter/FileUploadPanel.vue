<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { B64FileMeta } from '@/types/base64';

	const props = defineProps<{
		meta: B64FileMeta | null;
		loading: boolean;
	}>();

	const emit = defineEmits<{
		'file-selected': [file: File];
		reset: [];
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);
	const isDragging = ref(false);

	function handleFile(file: File | undefined | null) {
		if (file) emit('file-selected', file);
	}

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		handleFile(input.files?.[0]);
		input.value = '';
	}

	function onDrop(e: DragEvent) {
		isDragging.value = false;
		handleFile(e.dataTransfer?.files?.[0]);
	}

	/** 字节数格式化为可读大小 */
	function formatSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
	}
</script>

<template>
	<!-- 文件上传区：点击 / 拖拽选择任意本地文件 -->
	<div
		:class="isDragging ? 'border-blue-400 bg-blue-50/60' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'"
		class="relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition"
		@click="fileInput?.click()"
		@dragenter.prevent="isDragging = true"
		@dragover.prevent="isDragging = true"
		@dragleave.prevent="isDragging = false"
		@drop.prevent="onDrop"
	>
		<input ref="fileInput" class="hidden" type="file" @change="handleChange" />
		<div class="mb-3 text-slate-300">
			<TkuIcon :name="icons.file" :size="40" />
		</div>
		<p class="mb-1 text-sm font-medium text-gray-600">点击上传或拖拽文件到此处</p>
		<p class="text-xs text-gray-400">支持任意类型：图片 / PDF / Office / 压缩包 / 音视频等</p>
	</div>

	<!-- 已选文件信息 + 重新选择 -->
	<div
		v-if="props.meta"
		class="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
	>
		<div class="min-w-0">
			<div class="truncate text-sm font-medium text-slate-700">{{ props.meta.name }}</div>
			<div class="mt-0.5 text-[11px] text-slate-400">
				{{ formatSize(props.meta.size) }} · {{ props.meta.type || '未知类型' }}
			</div>
		</div>
		<n-button secondary size="tiny" @click="emit('reset')">重新选择</n-button>
	</div>
</template>
