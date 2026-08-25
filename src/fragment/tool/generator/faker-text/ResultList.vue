<script lang="ts" setup>
	defineProps<{
		items: string[];
	}>();

	const emit = defineEmits<{
		'copy-text': [text: string];
	}>();
</script>

<template>
	<div v-if="items.length" class="space-y-2">
		<div
			v-for="(t, i) in items"
			:key="i"
			class="cursor-pointer rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
			@click="emit('copy-text', t)"
		>
			<p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{{ t }}</p>
		</div>
	</div>
</template>
