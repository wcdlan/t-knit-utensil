<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import type { B64RestoreInfo } from '@/types/base64';

	const props = defineProps<{
		info: B64RestoreInfo | null;
		error: string;
		/** 预览用的对象 URL（图片 / PDF 等），文本类则用 previewText */
		previewUrl: string;
		previewText: string;
		/** 建议的还原文件名（含扩展名） */
		fileName: string;
	}>();

	const emit = defineEmits<{
		copy: [];
		download: [];
		reset: [];
	}>();
</script>

<template>
	<div class="space-y-4">
		<!-- 还原信息条：MIME / 扩展名 / 大小 -->
		<div
			v-if="props.info"
			class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600"
		>
			<span><span class="text-slate-400">识别类型：</span>{{ props.info.mime }}</span>
			<span><span class="text-slate-400">扩展名：</span>.{{ props.info.extension }}</span>
			<span><span class="text-slate-400">大小：</span>{{ (props.info.size / 1024).toFixed(2) }} KB</span>
			<span v-if="props.info.previewHint" class="text-amber-600">{{ props.info.previewHint }}</span>
		</div>

		<!-- 解码失败提示 -->
		<div v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
			{{ error }}
		</div>

		<!-- 预览区：始终渲染，支持图片 / 文本 / JSON 预览 -->
		<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/60">
			<div class="border-b border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-500">文件预览</div>
			<!-- 图片 / PDF 类：对象 URL 内联展示 -->
			<div v-if="props.previewUrl" class="flex justify-center bg-white p-4">
				<img :src="props.previewUrl" alt="文件预览" class="max-h-72 max-w-full rounded object-contain" />
			</div>
			<!-- 文本类：预读取的文本内容 -->
			<div v-else-if="props.previewText" class="max-h-72 overflow-y-auto bg-white p-3">
				<pre class="whitespace-pre-wrap break-all font-mono text-xs text-slate-700">{{ props.previewText }}</pre>
			</div>
			<!-- 空态占位：未输入 Base64 时保留结构 -->
			<div v-else class="flex h-24 items-center justify-center text-xs text-slate-300">
				粘贴 Base64 后此处显示文件预览
			</div>
		</div>

		<!-- 操作按钮：下载还原文件 / 复制 Base64 / 清空 -->
		<div class="flex flex-wrap items-center gap-2">
			<n-button :disabled="!props.info" size="small" type="primary" @click="emit('download')"> 下载还原文件 </n-button>
			<n-button :disabled="!props.info" secondary size="small" @click="emit('copy')">复制 Base64</n-button>
			<n-button :disabled="!props.info" secondary size="small" @click="emit('reset')">清空</n-button>
		</div>
	</div>
</template>
