<script lang="ts" setup>
	import { NAlert, NButton } from 'naive-ui';

	defineProps<{
		saved: boolean;
		error: string;
	}>();

	const emit = defineEmits<{
		save: [];
	}>();
</script>

<template>
	<!-- 保存操作栏：保存按钮 + 保存成功 / 失败提示 -->
	<div class="flex items-center gap-3">
		<n-button type="primary" @click="emit('save')"> 保存配置 </n-button>
		<!-- 保存成功提示 -->
		<n-alert v-if="saved" class="text-sm" type="success"> 配置已保存 </n-alert>
		<!-- 保存失败提示 -->
		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>
	</div>
</template>
