<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	defineProps<{
		naturalW: number;
		naturalH: number;
	}>();

	const emit = defineEmits<{
		reset: [];
		changeImage: [];
	}>();
</script>

<template>
	<div class="mt-3 flex items-center gap-4">
		<n-button size="small" @click="emit('reset')"> 重置裁剪 </n-button>
		<n-button size="small" @click="emit('changeImage')"> 更换图片 </n-button>
		<span class="text-xs text-gray-400"> 原始尺寸: {{ naturalW }}×{{ naturalH }} </span>
	</div>
</template>
