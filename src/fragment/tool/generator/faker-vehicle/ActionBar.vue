<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { VehicleRecord } from '@/types/faker';

	defineProps<{
		records: VehicleRecord[];
	}>();

	const emit = defineEmits<{
		generate: [];
		copyAll: [];
	}>();
</script>

<template>
	<div class="flex gap-2">
		<n-button type="primary" @click="emit('generate')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.refresh" :size="16" />
				<span>重新生成</span>
			</span>
		</n-button>
		<n-button :disabled="!records.length" secondary @click="emit('copyAll')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.clipboard" :size="16" />
				<span>复制全部</span>
			</span>
		</n-button>
	</div>
</template>
