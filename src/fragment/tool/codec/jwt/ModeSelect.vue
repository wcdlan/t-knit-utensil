<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { JwtMode } from '@/types/jwt';

	const props = defineProps<{
		mode: JwtMode;
	}>();

	const emit = defineEmits<{
		'update:mode': [value: JwtMode];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">操作模式</span>
		<n-button-group>
			<n-button :type="props.mode === 'decode' ? 'primary' : 'default'" @click="emit('update:mode', 'decode')">
				解析 Token
			</n-button>
			<n-button :type="props.mode === 'encode' ? 'primary' : 'default'" @click="emit('update:mode', 'encode')">
				生成 Token
			</n-button>
		</n-button-group>
	</div>
</template>
