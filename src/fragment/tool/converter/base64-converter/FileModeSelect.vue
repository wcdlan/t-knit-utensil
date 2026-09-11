<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { B64FileOp } from '@/types/base64';

	const props = defineProps<{
		op: B64FileOp;
	}>();

	const emit = defineEmits<{
		'update:op': [value: B64FileOp];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">文件操作</span>
		<n-button-group>
			<n-button :type="props.op === 'to-base64' ? 'primary' : 'default'" @click="emit('update:op', 'to-base64')">
				文件转 Base64
			</n-button>
			<n-button :type="props.op === 'from-base64' ? 'primary' : 'default'" @click="emit('update:op', 'from-base64')">
				Base64 还原文件
			</n-button>
		</n-button-group>
	</div>
</template>
