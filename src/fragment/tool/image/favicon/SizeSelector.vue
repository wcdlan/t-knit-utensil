<script lang="ts" setup>
	import { NCheckbox } from 'naive-ui';
	import type { FaviconSize } from '@/types/image';

	defineProps<{
		sizes: FaviconSize[];
	}>();

	const emit = defineEmits<{
		'toggle-size': [size: number];
	}>();
</script>

<template>
	<div>
		<p class="mb-2 text-sm font-medium text-gray-500">输出尺寸</p>
		<div class="flex flex-wrap gap-2">
			<div
				v-for="s in sizes"
				:key="s.size"
				:class="
					s.selected
						? 'border-blue-400 bg-blue-50 text-blue-700'
						: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
				"
				class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition"
				@click="emit('toggle-size', s.size)"
			>
				<n-checkbox :checked="s.selected" class="pointer-events-none" />
				<span>{{ s.label }}</span>
			</div>
		</div>
	</div>
</template>
