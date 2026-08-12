<script lang="ts" setup>
	import { Icon } from '@iconify/vue';

	defineProps<{
		name: string;
		size?: string | number;
	}>();
</script>

<template>
	<Icon :height="size" :icon="name" :width="size" />
</template>
