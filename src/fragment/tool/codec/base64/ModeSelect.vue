<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';

	const props = defineProps<{
		mode: 'encode' | 'decode';
	}>();

	const emit = defineEmits<{
		'update:mode': [value: 'encode' | 'decode'];
	}>();
</script>

<template>
	<div class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">操作模式</span>
		<n-button-group>
			<n-button :type="props.mode === 'encode' ? 'primary' : 'default'" @click="emit('update:mode', 'encode')">
				编码
			</n-button>
			<n-button :type="props.mode === 'decode' ? 'primary' : 'default'" @click="emit('update:mode', 'decode')">
				解码
			</n-button>
		</n-button-group>
	</div>
</template>
