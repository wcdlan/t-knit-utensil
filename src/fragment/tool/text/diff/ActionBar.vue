<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const emit = defineEmits<{
		compare: [];
		clear: [];
	}>();
</script>

<template>
	<div class="flex items-center gap-2">
		<n-button type="primary" @click="emit('compare')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.magnify" :size="16" />
				<span>对比</span>
			</span>
		</n-button>
		<n-button secondary @click="emit('clear')">清空</n-button>
	</div>
</template>
