<script lang="ts" setup>
	defineProps<{
		previewColor: string;
		hex: string;
	}>();

	const emit = defineEmits<{
		'update:hex': [value: string];
	}>();
</script>

<template>
	<div class="flex-shrink-0">
		<div
			:style="{ backgroundColor: previewColor }"
			class="w-36 h-36 rounded-2xl border border-slate-200 shadow-md relative overflow-hidden"
		>
			<div class="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10"></div>
		</div>
		<div class="mt-3 flex items-center gap-2">
			<div class="relative">
				<input
					:value="hex"
					class="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
					type="color"
					@input="emit('update:hex', ($event.target as HTMLInputElement).value)"
				/>
			</div>
			<span class="text-sm text-slate-500">取色</span>
		</div>
	</div>
</template>
