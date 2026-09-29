<script lang="ts" setup>
	import { computed } from 'vue';
	import { NAlert, NCollapse, NCollapseItem, NSpin, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { formatLatency } from '@/utils/dns';
	import type { PingAttempt, PingResult } from '@/types/dns';

	const props = defineProps<{
		/** 探测结果 */
		result: PingResult | null;
		/** 是否正在探测 */
		loading: boolean;
		/** 错误提示 */
		error: string;
	}>();

	const emit = defineEmits<{
		copy: [value: string, successText?: string];
	}>();

	/** 单次探测延迟的柱状图基准（最大延迟，至少 1ms 避免除零） */
	const latencyBase = computed(() => {
		const values = (props.result?.attempts ?? [])
			.map((item) => item.latencyMs)
			.filter((value): value is number => typeof value === 'number');
		return values.length ? Math.max(...values, 1) : 1;
	});

	/** 单次探测的状态标签配置 */
	function statusMeta(attempt: PingAttempt): { label: string; type: 'success' | 'warning' | 'error' | 'default' } {
		if (attempt.status === 'ok') return { label: '可达', type: 'success' };
		if (attempt.status === 'refused') return { label: '端口未开放', type: 'warning' };
		if (attempt.status === 'timeout') return { label: '超时', type: 'error' };
		return { label: attempt.detail || '错误', type: 'default' };
	}

	/** 丢包率对应的标签类型 */
	function lossTagType(lossRate: number): 'success' | 'warning' | 'error' {
		if (lossRate <= 0) return 'success';
		if (lossRate < 100) return 'warning';
		return 'error';
	}
</script>

<template>
	<div>
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">探测结果</span>
				<template v-if="props.result">
					<n-tag :bordered="false" round size="small">
						{{ props.result.mode === 'icmp' ? 'ICMP ping' : `TCP ${props.result.port}` }}
					</n-tag>
					<span class="font-mono text-xs text-slate-400">{{ props.result.host }} → {{ props.result.ip }}</span>
				</template>
			</div>
			<span v-if="props.result" class="text-xs text-slate-400">点击目标 IP 可复制</span>
		</div>

		<!-- 错误提示：主机解析失败 / ICMP 不可用等 -->
		<n-alert v-if="props.error" class="mb-3 text-sm" type="error">{{ props.error }}</n-alert>

		<!-- 加载中 -->
		<div
			v-if="props.loading"
			class="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 py-10"
		>
			<n-spin size="small" />
			<span class="text-sm text-slate-400">正在探测目标可达性…</span>
		</div>

		<div v-else-if="props.result" class="space-y-3">
			<!-- 统计概览 -->
			<div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
				<div
					class="cursor-pointer rounded-lg bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
					@click="emit('copy', props.result.ip, `已复制 ${props.result.ip}`)"
				>
					<div class="text-[11px] font-medium text-slate-400">目标 IP</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">{{ props.result.ip }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">可达 / 发送</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">
						{{ props.result.received }} / {{ props.result.sent }}
					</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">丢包率</div>
					<div class="mt-0.5">
						<n-tag :bordered="false" :type="lossTagType(props.result.lossRate)" round size="small">
							{{ props.result.lossRate }}%
						</n-tag>
					</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">最小延迟</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">{{ formatLatency(props.result.min) }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">平均延迟</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">{{ formatLatency(props.result.avg) }}</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">最大延迟</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">{{ formatLatency(props.result.max) }}</div>
				</div>
			</div>

			<!-- 逐次探测：延迟柱状对比 -->
			<div class="space-y-1.5">
				<div
					v-for="attempt in props.result.attempts"
					:key="attempt.index"
					class="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
				>
					<span class="w-10 shrink-0 font-mono text-xs text-slate-400">#{{ attempt.index }}</span>
					<n-tag :bordered="false" :type="statusMeta(attempt).type" round size="tiny">
						{{ statusMeta(attempt).label }}
					</n-tag>
					<div class="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-slate-200">
						<div
							:class="attempt.status === 'ok' || attempt.status === 'refused' ? 'bg-blue-500' : 'bg-rose-300'"
							:style="{
								width:
									attempt.latencyMs === null
										? '100%'
										: `${Math.max(4, Math.round((attempt.latencyMs / latencyBase) * 100))}%`
							}"
							class="h-full rounded-full"
						/>
					</div>
					<span class="w-20 shrink-0 text-right font-mono text-xs text-slate-500">
						{{ formatLatency(attempt.latencyMs) }}
					</span>
				</div>
			</div>

			<!-- ICMP 原始输出：便于排查解析差异 -->
			<n-collapse v-if="props.result.raw" class="mt-1">
				<n-collapse-item name="raw" title="原始 ping 输出">
					<pre
						class="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900/95 p-3 font-mono text-[11px] leading-relaxed text-slate-100"
						>{{ props.result.raw }}</pre>
				</n-collapse-item>
			</n-collapse>
		</div>

		<!-- 结果占位：未探测时保持结构稳定 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入主机名或 IP 并点击开始检测，探测结果将显示在这里</p>
		</div>

		<p v-if="props.result" class="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
			<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0" />
			<span>探测从部署服务器发起，返回“端口未开放”同样说明主机可达，只有超时才表示不可达。</span>
		</p>
	</div>
</template>
