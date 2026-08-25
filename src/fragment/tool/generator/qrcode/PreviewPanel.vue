<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		qrUrl: string;
		text: string;
		size: number;
	}>();
</script>

<template>
	<div class="flex flex-col items-center">
		<div v-if="qrUrl" class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
			<img :alt="text" :height="size" :src="qrUrl" :width="size" class="block rounded-lg" />
		</div>
		<div v-else class="flex flex-col items-center justify-center py-16 text-center w-full">
			<div class="w-20 h-20 mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
				<span class="text-slate-300">
					<TkuIcon :name="icons.qrcode" :size="32" />
				</span>
			</div>
			<p class="text-slate-400 text-sm">输入内容后自动生成二维码</p>
			<p class="text-slate-300 text-xs mt-1">支持文本、网址等内容</p>
		</div>
	</div>
</template>
