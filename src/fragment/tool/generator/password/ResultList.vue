<script lang="ts" setup>
	import { NButton } from 'naive-ui';

	defineProps<{
		passwords: string[];
	}>();

	const emit = defineEmits<{
		copyOne: [pwd: string];
	}>();
</script>

<template>
	<div class="space-y-1.5">
		<div
			v-for="(pwd, i) in passwords"
			:key="i"
			class="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition animate-fade-in cursor-pointer"
			@click="emit('copyOne', pwd)"
		>
			<code class="text-sm font-mono text-slate-700">{{ pwd }}</code>
			<n-button
				class="opacity-0 group-hover:opacity-100 transition"
				secondary
				size="tiny"
				@click.stop="emit('copyOne', pwd)"
			>
				复制
			</n-button>
		</div>
	</div>
</template>
