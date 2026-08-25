<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	defineProps<{
		hex: string;
	}>();

	const emit = defineEmits<{
		'update:hex': [value: string];
		copy: [value: string];
	}>();
</script>

<template>
	<div>
		<label class="block text-xs font-semibold text-slate-500 mb-2">HEX</label>
		<div class="flex gap-2">
			<n-input
				:value="hex"
				class="flex-1 !font-mono"
				placeholder="#000000"
				@update:value="emit('update:hex', $event)"
			/>
			<n-button secondary size="small" @click="emit('copy', hex)">复制</n-button>
		</div>
	</div>
</template>
