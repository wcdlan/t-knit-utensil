<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { B64Target } from '@/types/base64';

	const props = defineProps<{
		target: B64Target;
	}>();

	const emit = defineEmits<{
		'update:target': [value: B64Target];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">转换对象</span>
		<n-button-group>
			<n-button :type="props.target === 'text' ? 'primary' : 'default'" @click="emit('update:target', 'text')">
				文本
			</n-button>
			<n-button :type="props.target === 'file' ? 'primary' : 'default'" @click="emit('update:target', 'file')">
				文件
			</n-button>
		</n-button-group>
	</div>
</template>
