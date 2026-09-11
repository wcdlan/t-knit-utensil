<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { B64TextOp } from '@/types/base64';

	const props = defineProps<{
		op: B64TextOp;
	}>();

	const emit = defineEmits<{
		'update:op': [value: B64TextOp];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">文本操作</span>
		<n-button-group>
			<n-button :type="props.op === 'encode' ? 'primary' : 'default'" @click="emit('update:op', 'encode')">
				编码
			</n-button>
			<n-button :type="props.op === 'decode' ? 'primary' : 'default'" @click="emit('update:op', 'decode')">
				解码
			</n-button>
		</n-button-group>
	</div>
</template>
