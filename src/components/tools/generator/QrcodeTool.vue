<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NInput, NSelect } from 'naive-ui';

	const text = ref('');
	const size = ref(200);

	const sizeOptions = [
		{ label: '150 x 150', value: 150 },
		{ label: '200 x 200', value: 200 },
		{ label: '300 x 300', value: 300 },
		{ label: '400 x 400', value: 400 }
	];

	const qrUrl = computed(() => {
		if (!text.value) return '';
		return `https://api.qrserver.com/v1/create-qr-code/?size=${size.value}x${size.value}&data=${encodeURIComponent(text.value)}`;
	});
</script>

<template>
	<div class="space-y-6">
		<!-- Input section -->
		<div class="p-5 bg-slate-50/50 rounded-xl border border-slate-100">
			<div class="flex flex-col sm:flex-row gap-4 items-end">
				<div class="flex-1 w-full">
					<label class="block text-xs font-semibold text-slate-500 mb-2">内容</label>
					<n-input
						v-model:value="text"
						:autosize="{ minRows: 3, maxRows: 6 }"
						placeholder="输入文本或网址..."
						type="textarea"
					/>
				</div>
				<div class="w-full sm:w-auto">
					<label class="block text-xs font-semibold text-slate-500 mb-2">尺寸</label>
					<n-select v-model:value="size" :options="sizeOptions" class="!w-[140px]" />
				</div>
			</div>
		</div>

		<!-- Preview section -->
		<div class="flex flex-col items-center">
			<div v-if="qrUrl" class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
				<img :alt="text" :height="size" :src="qrUrl" :width="size" class="block rounded-lg" />
			</div>
			<div v-else class="flex flex-col items-center justify-center py-16 text-center w-full">
				<div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
					<span class="text-3xl opacity-30">📱</span>
				</div>
				<p class="text-slate-400 text-sm">输入内容后自动生成二维码</p>
				<p class="text-slate-300 text-xs mt-1">支持文本、网址等内容</p>
			</div>
		</div>
	</div>
</template>
