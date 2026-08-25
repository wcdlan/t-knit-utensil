<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const emit = defineEmits<{
		format: [];
		compress: [];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-2">
		<n-button type="primary" @click="emit('format')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.star" :size="16" />
				<span>格式化</span>
			</span>
		</n-button>
		<n-button type="info" @click="emit('compress')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.package" :size="16" />
				<span>压缩</span>
			</span>
		</n-button>
	</div>
</template>
