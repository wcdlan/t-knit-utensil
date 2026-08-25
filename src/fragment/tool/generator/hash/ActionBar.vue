<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	const emit = defineEmits<{
		process: [];
	}>();
</script>

<template>
	<n-button type="primary" @click="emit('process')">计算哈希</n-button>
</template>
