<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	const emit = defineEmits<{
		process: [];
	}>();
</script>

<template>
	<n-button type="primary" @click="emit('process')">
		<span class="flex items-center gap-1.5">
			<span>转换</span>
			<span class="text-xs opacity-60">&rarr;</span>
		</span>
	</n-button>
</template>
