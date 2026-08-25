<script lang="ts" setup>
	import { NAlert } from 'naive-ui';

	defineProps<{
		message: string;
		type: 'success' | 'error';
	}>();
</script>

<template>
	<!-- Feedback alert -->
	<n-alert v-if="message" :type="type" class="text-sm flex-shrink-0">
		{{ message }}
	</n-alert>
</template>
