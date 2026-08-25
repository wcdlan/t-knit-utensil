<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';

	defineProps<{
		value: string;
		generating: boolean;
	}>();

	const emit = defineEmits<{
		copy: [];
		download: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-semibold text-slate-500">公钥</span>
			<div class="flex gap-2">
				<n-button secondary size="small" @click="emit('copy')"> 复制 </n-button>
				<n-button secondary size="small" @click="emit('download')"> 下载 </n-button>
			</div>
		</div>
		<n-input
			:autosize="{ minRows: 3 }"
			:class="{ shimmer: generating }"
			:value="value"
			class="cursor-pointer"
			placeholder="点击「生成密钥对」生成公钥"
			readonly
			type="textarea"
			@click="emit('copy')"
		/>
	</div>
</template>
