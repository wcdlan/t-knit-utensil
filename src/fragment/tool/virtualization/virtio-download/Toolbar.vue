<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		loading: boolean;
		totalCount: number;
	}>();

	const emit = defineEmits<{
		refresh: [];
	}>();
</script>

<template>
	<div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="flex items-center gap-2">
			<span class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
				<TkuIcon :name="icons.download" :size="14" />
				VirtIO 版本归档
			</span>
			<span v-if="!loading" class="text-[11px] text-slate-400">
				共 {{ totalCount }} 个版本 · 点击左侧版本查看文件
			</span>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-[11px] text-slate-400">
				数据来源：
				<a
					class="text-blue-500 hover:text-blue-600 underline"
					href="https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio/"
					rel="noopener noreferrer"
					target="_blank"
				>
					fedorapeople.org
				</a>
			</span>
			<n-button :disabled="loading" secondary size="small" @click="emit('refresh')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.refresh" :size="14" />
					刷新
				</span>
			</n-button>
		</div>
	</div>
</template>
