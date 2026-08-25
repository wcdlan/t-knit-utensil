<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		loading: boolean;
		disabled: boolean;
	}>();

	const emit = defineEmits<{
		obfuscate: [];
	}>();
</script>

<template>
	<!-- ActionBar：混淆操作按钮（在输入与输出之间垂直居中） -->
	<div class="flex lg:flex-col items-stretch justify-center gap-2 py-2">
		<n-button
			:disabled="disabled"
			:loading="loading"
			class="w-full action-btn"
			type="primary"
			@click="emit('obfuscate')"
		>
			<span class="flex w-full items-center gap-1.5">
				<TkuIcon :name="icons.shuffle" :size="16" class="shrink-0" />
				<span class="flex-1 text-center">混淆</span>
			</span>
		</n-button>
	</div>
</template>

<style scoped>
	/* 中间操作按钮：内容撑满全宽，图标左对齐，文本居中自动间距 */
	.action-btn {
		width: 100%;
	}

	.action-btn :deep(.n-button__content) {
		width: 100%;
		justify-content: flex-start;
	}
</style>
