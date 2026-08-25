<script lang="ts" setup>
	import { ref } from 'vue';
	import { NButton, NCard, NInput, NPopover, NSwitch, NTooltip } from 'naive-ui';
	import { icons, QUICK_LINK_ICONS } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { QuickLink } from '@/types/site';

	defineProps<{
		quickLinks: QuickLink[];
	}>();

	const emit = defineEmits<{
		add: [];
		remove: [index: number];
		'select-icon': [link: QuickLink, value: string];
	}>();

	// 图标选择浮层显隐（UI 局部状态）
	const linkPopoverVisible = ref(false);

	function toggleLinkPopover() {
		linkPopoverVisible.value = !linkPopoverVisible.value;
	}
</script>

<template>
	<!-- 快捷连接卡片：站点快速链接列表（图标 / 名称 / URL / 新标签开关） -->
	<n-card size="small" title="快捷连接">
		<div class="space-y-3">
			<div
				v-for="(link, index) in quickLinks"
				:key="index"
				class="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2"
			>
				<!-- 图标选择浮层 -->
				<n-popover v-model:show="linkPopoverVisible" placement="bottom-start" trigger="click">
					<template #trigger>
						<button
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-500"
							type="button"
							@click="toggleLinkPopover"
						>
							<TkuIcon :name="link.icon" :size="18" />
						</button>
					</template>
					<div class="grid w-[228px] grid-cols-6 gap-1">
						<button
							v-for="opt in QUICK_LINK_ICONS"
							:key="opt.value"
							:title="opt.label"
							class="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
							type="button"
							@click="emit('select-icon', link, opt.value)"
						>
							<TkuIcon :name="opt.value" :size="20" />
						</button>
					</div>
				</n-popover>
				<div class="w-32 shrink-0">
					<n-input v-model:value="link.name" placeholder="名称（提示）" size="small" />
				</div>
				<div class="flex-1 min-w-0">
					<n-input v-model:value="link.url" placeholder="https://..." size="small" />
				</div>
				<!-- 新标签页开关 -->
				<n-tooltip>
					<template #trigger>
						<n-switch v-model:value="link.newTab" class="shrink-0" size="small" />
					</template>
					新标签页打开
				</n-tooltip>
				<button
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
					title="删除"
					type="button"
					@click="emit('remove', index)"
				>
					<TkuIcon :name="icons.close" :size="16" />
				</button>
			</div>
			<n-button dashed size="small" @click="emit('add')"> 添加快捷连接 </n-button>
		</div>
	</n-card>
</template>
