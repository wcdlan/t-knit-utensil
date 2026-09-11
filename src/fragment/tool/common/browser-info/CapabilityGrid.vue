<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { CapabilityItem } from '@/types/browser';

	const props = defineProps<{
		items: CapabilityItem[];
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();

	/** 已支持项数量 */
	const supportedCount = computed(() => props.items.filter((item) => item.supported).length);
	/** 当前名称（用于复制清单） */
	const supportedNames = computed(() =>
		props.items
			.filter((item) => item.supported)
			.map((item) => item.label)
			.join('、')
	);
</script>

<template>
	<!-- 能力检测卡片：展示浏览器对各项 Web 特性的支持情况 -->
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<span class="text-slate-400">
					<TkuIcon :name="icons.check" :size="16" />
				</span>
				<label class="text-xs font-semibold text-slate-500">能力与特性检测</label>
				<span class="text-[10px] text-slate-400">已支持 {{ supportedCount }} / {{ props.items.length }} 项</span>
			</div>
			<!-- 复制已支持能力清单 -->
			<n-button secondary size="tiny" @click="emit('copy', supportedNames)">复制支持清单</n-button>
		</div>

		<div class="flex flex-wrap gap-1.5">
			<!-- 支持项：绿色；不支持项：灰色 -->
			<n-tag
				v-for="item in props.items"
				:key="item.label"
				:bordered="false"
				:title="item.detail"
				:type="item.supported ? 'success' : 'default'"
				size="small"
			>
				<span class="flex items-center gap-1">
					<TkuIcon :name="item.supported ? icons.check : icons.close" :size="12" />
					<span>{{ item.label }}</span>
				</span>
			</n-tag>
		</div>
	</div>
</template>
