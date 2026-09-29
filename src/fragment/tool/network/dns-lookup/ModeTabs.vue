<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { DnsToolKey, DnsToolMeta } from '@/types/dns';

	const props = defineProps<{
		/** 全部子工具页签元数据 */
		tabs: DnsToolMeta[];
		/** 当前激活的子工具 */
		active: DnsToolKey;
	}>();

	const emit = defineEmits<{
		'update:active': [value: DnsToolKey];
	}>();
</script>

<template>
	<!-- 子工具切换：按钮组可自动换行，窄屏下不会出现横向滚动 -->
	<div class="flex flex-wrap gap-2">
		<n-button
			v-for="tab in props.tabs"
			:key="tab.key"
			:secondary="props.active !== tab.key"
			:type="props.active === tab.key ? 'primary' : 'default'"
			size="small"
			@click="emit('update:active', tab.key)"
		>
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="tab.icon" :size="16" />
				<span>{{ tab.label }}</span>
			</span>
		</n-button>
	</div>
</template>
