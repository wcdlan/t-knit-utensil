<script lang="ts" setup>
	import { computed } from 'vue';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { isImageIcon } from '@/utils/icon';

	const props = defineProps<{
		/** 图标值：Iconify 图标名（mdi: 前缀）或自定义图片地址 / Data URL */
		icon: string;
		/** 图标尺寸（数字按 px，字符串原样使用） */
		size?: string | number;
	}>();

	/** 是否为自定义上传 / 图片地址图标 */
	const isImage = computed(() => isImageIcon(props.icon));

	/** 图片尺寸样式（img 不支持 Iconify 的 size 属性，需转成 CSS 尺寸） */
	const imageStyle = computed(() => {
		const value = typeof props.size === 'number' ? `${props.size}px` : (props.size ?? '18px');
		return { width: value, height: value };
	});
</script>

<template>
	<!-- QuickLinkIcon：统一渲染快捷链接图标，兼容内置 Iconify 图标与自定义上传图片 -->
	<img v-if="isImage" :src="icon" :style="imageStyle" alt="" class="shrink-0 object-contain" />
	<TkuIcon v-else :name="icon" :size="size" />
</template>
