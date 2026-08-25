<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	defineProps<{
		uuids: string[];
	}>();

	const emit = defineEmits<{
		copyOne: [uuid: string];
	}>();
</script>

<template>
	<div class="space-y-1.5">
		<div
			v-for="(uuid, i) in uuids"
			:key="i"
			class="flex cursor-pointer items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition animate-fade-in"
			@click="emit('copyOne', uuid)"
		>
			<code class="text-sm font-mono text-slate-700">{{ uuid }}</code>
			<n-button class="pointer-events-none opacity-0 group-hover:opacity-100 transition" secondary size="tiny">
				复制
			</n-button>
		</div>
	</div>
</template>
