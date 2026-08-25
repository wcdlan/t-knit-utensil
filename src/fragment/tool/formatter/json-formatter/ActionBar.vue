<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const emit = defineEmits<{
		format: [];
		compress: [];
		validate: [];
	}>();
</script>

<template>
	<!-- 操作按钮区（在输入与输出之间垂直居中） -->
	<div class="flex lg:flex-col items-stretch justify-center gap-2 py-2">
		<n-button class="w-full action-btn" type="primary" @click="emit('format')">
			<span class="flex w-full items-center gap-1.5">
				<TkuIcon :name="icons.star" :size="16" class="shrink-0" />
				<span class="flex-1 text-center">格式化</span>
			</span>
		</n-button>
		<n-button class="w-full action-btn" type="info" @click="emit('compress')">
			<span class="flex w-full items-center gap-1.5">
				<TkuIcon :name="icons.package" :size="16" class="shrink-0" />
				<span class="flex-1 text-justify text-last-justify">压缩</span>
			</span>
		</n-button>
		<n-button class="w-full action-btn" type="success" @click="emit('validate')">
			<span class="flex w-full items-center gap-1.5">
				<TkuIcon :name="icons.check" :size="16" class="shrink-0" />
				<span class="flex-1 text-justify text-last-justify">校验</span>
			</span>
		</n-button>
	</div>
</template>

<style scoped>
	/* 中间三个操作按钮：内容撑满全宽，图标左对齐，文本居中自动间距 */
	.action-btn {
		width: 100%;

		.text-last-justify {
			text-align-last: justify;
		}
	}

	.action-btn :deep(.n-button__content) {
		width: 100%;
		justify-content: flex-start;
	}
</style>
