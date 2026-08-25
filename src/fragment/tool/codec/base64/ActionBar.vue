<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	defineProps<{
		output: string;
	}>();

	const emit = defineEmits<{
		process: [];
		swap: [];
	}>();
</script>

<template>
	<div class="flex items-center gap-3">
		<n-button type="primary" @click="emit('process')">
			<span class="flex items-center gap-1.5">
				<span>转换</span>
				<span class="text-xs opacity-60">&rarr;</span>
			</span>
		</n-button>
		<n-button :disabled="!output" secondary @click="emit('swap')">
			<span class="flex items-center gap-1.5">
				<span>&#8596;</span>
				<span>交换</span>
			</span>
		</n-button>
	</div>
</template>
