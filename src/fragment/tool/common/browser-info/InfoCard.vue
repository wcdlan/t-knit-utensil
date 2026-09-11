<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { BrowserInfoSection } from '@/types/browser';

	const props = defineProps<{
		section: BrowserInfoSection;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<!-- 信息卡片：展示单个信息分组（浏览器 / 系统 / 屏幕 / 网络 / 存储 / 电池 / 性能） -->
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex items-center gap-2">
			<span class="text-slate-400">
				<TkuIcon :name="props.section.icon" :size="16" />
			</span>
			<label class="text-xs font-semibold text-slate-500">{{ props.section.title }}</label>
		</div>
		<!-- 信息条目：点击任意一行复制该行内容 -->
		<div class="space-y-1">
			<div
				v-for="item in props.section.items"
				:key="item.label"
				class="group flex cursor-pointer items-start justify-between gap-3 rounded-lg px-2 py-1.5 transition hover:bg-blue-50/60"
				@click="emit('copy', item.value)"
			>
				<span class="shrink-0 text-[11px] text-slate-400">{{ item.label }}</span>
				<!-- 值：长文本（UA / 显卡型号等）用等宽字体并允许换行 -->
				<span
					:class="item.mono ? 'font-mono' : ''"
					class="min-w-0 break-all text-right text-xs font-medium text-slate-700"
				>
					{{ item.value }}
				</span>
			</div>
		</div>
	</div>
</template>
