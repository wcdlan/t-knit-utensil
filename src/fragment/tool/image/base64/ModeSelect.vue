<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { ImageBase64Mode } from '@/types/image';

	const props = defineProps<{
		mode: ImageBase64Mode;
	}>();

	const emit = defineEmits<{
		'update:mode': [value: ImageBase64Mode];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">操作模式</span>
		<n-button-group>
			<n-button
				:type="props.mode === 'image-to-base64' ? 'primary' : 'default'"
				@click="emit('update:mode', 'image-to-base64')"
			>
				图片转 Base64
			</n-button>
			<n-button
				:type="props.mode === 'base64-to-image' ? 'primary' : 'default'"
				@click="emit('update:mode', 'base64-to-image')"
			>
				Base64 转图片
			</n-button>
		</n-button-group>
	</div>
</template>
