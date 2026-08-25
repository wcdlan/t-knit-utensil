<script lang="ts" setup>
	import { NButton, NButtonGroup } from 'naive-ui';
	import { KEY_TYPES } from '@/utils/ssh';
	import type { KeyType } from '@/types/ssh';

	const props = defineProps<{
		keyType: KeyType;
	}>();

	const emit = defineEmits<{
		'update:keyType': [value: KeyType];
	}>();

	const keyTypes = Object.entries(KEY_TYPES).map(([id, meta]) => ({
		id: id as KeyType,
		label: meta.label
	}));
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">密钥类型</span>
		<n-button-group>
			<n-button
				v-for="kt in keyTypes"
				:key="kt.id"
				:type="props.keyType === kt.id ? 'primary' : 'default'"
				@click="emit('update:keyType', kt.id)"
			>
				{{ kt.label }}
			</n-button>
		</n-button-group>
	</div>
</template>
