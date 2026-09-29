<script lang="ts" setup>
	import { NAlert, NButton, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { RandomPortEntry } from '@/types/port';

	const props = defineProps<{
		/** 生成的端口条目（按端口号升序） */
		entries: RandomPortEntry[];
		/** 剔除排除项后的候选端口总数 */
		poolSize: number;
		/** 请求数量是否超过候选数量 */
		insufficient: boolean;
	}>();

	const emit = defineEmits<{
		copy: [value: string, successText?: string];
	}>();

	/** 端口区间对应的标签类型（系统端口偏警示、动态端口偏中性） */
	function rangeTagType(rangeName: string): 'error' | 'warning' | 'info' {
		if (rangeName === '系统端口') return 'error';
		if (rangeName === '注册端口') return 'warning';
		return 'info';
	}
</script>

<template>
	<div>
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">生成结果</span>
				<n-tag :bordered="false" round size="small">{{ props.entries.length }} 个端口</n-tag>
				<span class="text-xs text-slate-400">候选端口 {{ props.poolSize }} 个</span>
			</div>
			<span class="text-xs text-slate-400">点击任意端口即可复制</span>
		</div>

		<!-- 候选端口为空：提示调整范围或关闭排除项 -->
		<n-alert v-if="!props.entries.length" class="text-sm" type="warning">
			当前条件下没有可用候选端口，请扩大端口范围，或关闭「排除系统端口 / 排除常用服务端口」后重试。
		</n-alert>

		<!-- 结果网格：端口号 + 区间标签 + 常用服务命中提示 -->
		<div v-else class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			<div
				v-for="entry in props.entries"
				:key="entry.port"
				class="group flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50/50"
				@click="emit('copy', String(entry.port), `已复制端口 ${entry.port}`)"
			>
				<div class="flex min-w-0 items-center gap-2">
					<span class="font-mono text-lg font-semibold tabular-nums text-slate-800">{{ entry.port }}</span>
					<n-tag :bordered="false" :type="rangeTagType(entry.rangeName)" round size="tiny">
						{{ entry.rangeName }}
					</n-tag>
				</div>
				<div class="flex shrink-0 items-center gap-1">
					<span
						v-if="entry.service"
						:title="`命中常用端口：${entry.service}`"
						class="flex max-w-[9rem] items-center gap-0.5 truncate text-[10px] text-amber-600"
					>
						<TkuIcon :name="icons.alert" :size="12" />
						<span class="truncate">{{ entry.service }}</span>
					</span>
					<n-button
						class="pointer-events-none opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
						secondary
						size="tiny"
						@click.stop="emit('copy', String(entry.port), `已复制端口 ${entry.port}`)"
					>
						复制
					</n-button>
				</div>
			</div>
		</div>

		<!-- 结果占位：候选充足但结果被清空时保持结构稳定 -->
		<div
			v-if="!props.entries.length && props.poolSize > 0"
			class="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center"
		>
			<p class="text-sm text-slate-400">随机端口将显示在这里</p>
		</div>

		<p v-if="props.entries.length" class="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
			<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0" />
			<span>生成结果仅表示未落在常用服务端口内，使用前请在目标主机上确认端口是否真的空闲。</span>
		</p>
	</div>
</template>
