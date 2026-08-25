<script lang="ts" setup>
	import { NCheckbox } from 'naive-ui';

	defineProps<{
		png: boolean;
		ico: boolean;
	}>();

	const emit = defineEmits<{
		'update:png': [value: boolean];
		'update:ico': [value: boolean];
	}>();
</script>

<template>
	<div>
		<p class="mb-2 text-sm font-medium text-gray-500">输出格式</p>
		<div class="flex gap-3">
			<label
				:class="
					png
						? 'border-blue-400 bg-blue-50 text-blue-700'
						: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
				"
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition"
			>
				<n-checkbox :checked="png" @update:checked="(v: boolean) => emit('update:png', v)" />
				<span class="font-medium">PNG</span>
				<span class="text-xs opacity-70">透明背景</span>
			</label>
			<label
				:class="
					ico
						? 'border-blue-400 bg-blue-50 text-blue-700'
						: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
				"
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition"
			>
				<n-checkbox :checked="ico" @update:checked="(v: boolean) => emit('update:ico', v)" />
				<span class="font-medium">ICO</span>
				<span class="text-xs opacity-70">传统格式</span>
			</label>
		</div>
	</div>
</template>
