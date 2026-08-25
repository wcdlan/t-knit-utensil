<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	const props = defineProps<{
		items: string[];
	}>();

	const emit = defineEmits<{
		copy: [item: string];
	}>();
</script>

<template>
	<div v-if="props.items.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
		<div
			v-for="(item, i) in props.items"
			:key="i"
			class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
			@click="emit('copy', item)"
		>
			<span class="truncate text-sm text-slate-700">{{ item }}</span>
			<n-button class="pointer-events-none opacity-0 transition group-hover:opacity-100" secondary size="tiny">
				复制
			</n-button>
		</div>
	</div>
</template>
