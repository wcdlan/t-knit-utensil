<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		/** 异步信息（公网 IP / 电池 / 存储）是否查询中 */
		loading: boolean;
		/** 是否已实测过刷新率 */
		refreshRateDetected: boolean;
		/** 刷新率检测中 */
		detectingRate: boolean;
	}>();

	const emit = defineEmits<{
		refresh: [];
		detectRefreshRate: [];
		copyAll: [];
	}>();
</script>

<template>
	<!-- 操作栏：重新采集 / 检测刷新率 / 复制全部信息 -->
	<div class="flex flex-wrap items-center gap-2">
		<n-button :loading="props.loading" type="primary" @click="emit('refresh')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.refresh" :size="16" />
				<span>重新检测</span>
			</span>
		</n-button>
		<n-button :loading="props.detectingRate" secondary @click="emit('detectRefreshRate')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.monitorScreenshot" :size="16" />
				<span>{{ props.refreshRateDetected ? '重新检测刷新率' : '检测屏幕刷新率' }}</span>
			</span>
		</n-button>
		<n-button secondary @click="emit('copyAll')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.clipboard" :size="16" />
				<span>复制全部信息</span>
			</span>
		</n-button>
	</div>
</template>
