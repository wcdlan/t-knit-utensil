<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NProgress } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { formatDuration } from '@/utils/keyboard';
	import type { KeyboardStats } from '@/types/keyboard';

	const props = defineProps<{
		stats: KeyboardStats;
	}>();

	const emit = defineEmits<{
		reset: [];
	}>();

	/** 键位覆盖率（已测试键位 / 当前布局总键位） */
	const coverage = computed(() => {
		if (!props.stats.keysTotal) return 0;
		return Math.round((props.stats.unique / props.stats.keysTotal) * 100);
	});
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">按键统计</label>
			<!-- 重置统计与已测试标记 -->
			<n-button secondary size="tiny" @click="emit('reset')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.refresh" :size="14" />
					<span>重置</span>
				</span>
			</n-button>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<div class="rounded-lg bg-slate-50 px-3 py-2">
				<div class="text-[11px] text-slate-400">总计按键</div>
				<div class="mt-0.5 font-mono text-lg font-semibold text-slate-700">{{ props.stats.total }}</div>
			</div>
			<div class="rounded-lg bg-slate-50 px-3 py-2">
				<div class="text-[11px] text-slate-400">APM（每分钟）</div>
				<div class="mt-0.5 font-mono text-lg font-semibold text-blue-600">{{ props.stats.apm }}</div>
			</div>
			<div class="rounded-lg bg-slate-50 px-3 py-2">
				<div class="text-[11px] text-slate-400">APM 峰值</div>
				<div class="mt-0.5 font-mono text-lg font-semibold text-slate-700">{{ props.stats.peakApm }}</div>
			</div>
			<div class="rounded-lg bg-slate-50 px-3 py-2">
				<div class="text-[11px] text-slate-400">测试时长</div>
				<div class="mt-0.5 font-mono text-lg font-semibold text-slate-700">
					{{ formatDuration(props.stats.elapsed) }}
				</div>
			</div>
		</div>

		<!-- 键位覆盖率 -->
		<div class="mt-3">
			<div class="mb-1 flex items-center justify-between text-[11px] text-slate-400">
				<span>键位覆盖率</span>
				<span>{{ props.stats.unique }} / {{ props.stats.keysTotal }}（{{ coverage }}%）</span>
			</div>
			<n-progress :height="6" :percentage="coverage" :show-indicator="false" status="info" />
		</div>
	</div>
</template>
