<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import type { UnicodeMode } from '@/types/unicode';

	const props = defineProps<{
		mode: UnicodeMode;
	}>();

	const emit = defineEmits<{
		'update:mode': [value: UnicodeMode];
	}>();
</script>

<template>
	<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
		<div class="flex items-center gap-3">
			<span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">操作模式</span>
			<n-button-group>
				<n-button
					:type="props.mode === 'to-unicode' ? 'primary' : 'default'"
					@click="emit('update:mode', 'to-unicode')"
				>
					中文 → Unicode
				</n-button>
				<n-button
					:type="props.mode === 'to-chinese' ? 'primary' : 'default'"
					@click="emit('update:mode', 'to-chinese')"
				>
					Unicode → 中文
				</n-button>
			</n-button-group>
		</div>
	</div>
</template>
