<script lang="ts" setup>
	import { NTag } from 'naive-ui';
	import type { LiveKeyInfo } from '@/types/keyboard';

	const props = defineProps<{
		info: LiveKeyInfo | null;
		/** 当前是否正按住按键（用于组合键测试提示） */
		holding: boolean;
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">当前按键信息</label>
			<!-- 组合键 / 单键状态标记 -->
			<n-tag v-if="props.info" :bordered="false" size="tiny" type="info">
				{{ props.holding ? '按住中' : '已释放' }}
			</n-tag>
		</div>

		<!-- 空态占位：结果区始终渲染 -->
		<div
			v-if="!props.info"
			class="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<p class="text-xs text-slate-400">按下键盘任意按键开始测试</p>
			<p class="mt-1 text-[11px] text-slate-300">支持同时按住多个键进行组合键测试</p>
		</div>

		<div v-else class="space-y-3">
			<!-- 组合键展示 -->
			<div class="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2.5">
				<div class="text-[11px] text-blue-500">组合键</div>
				<div class="mt-0.5 break-all font-mono text-lg font-semibold text-blue-700">{{ props.info.combo }}</div>
			</div>

			<!-- 键位信息明细 -->
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] text-slate-400">event.key</div>
					<div class="mt-0.5 truncate font-mono text-sm text-slate-700">{{ props.info.key || '(空)' }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] text-slate-400">event.code</div>
					<div class="mt-0.5 truncate font-mono text-sm text-slate-700">{{ props.info.code }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] text-slate-400">keyCode</div>
					<div class="mt-0.5 truncate font-mono text-sm text-slate-700">{{ props.info.keyCode }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] text-slate-400">所属键区</div>
					<div class="mt-0.5 truncate text-sm text-slate-700">{{ props.info.location }}</div>
				</div>
			</div>

			<!-- 当前按住的修饰键 -->
			<div class="flex flex-wrap items-center gap-1.5">
				<span class="text-[11px] text-slate-400">修饰键：</span>
				<template v-if="props.info.modifiers.length">
					<n-tag v-for="modifier in props.info.modifiers" :key="modifier" :bordered="false" size="tiny">
						{{ modifier }}
					</n-tag>
				</template>
				<span v-else class="text-[11px] text-slate-300">无</span>
			</div>
		</div>
	</div>
</template>
