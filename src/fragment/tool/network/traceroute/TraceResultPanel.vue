<script lang="ts" setup>
	import { computed } from 'vue';
	import { NAlert, NButton, NCollapse, NCollapseItem, NSpin, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { averageHopLatency, formatHopLatencies, formatProbeLatency } from '@/utils/trace';
	import type { TraceHop, TraceResult } from '@/types/trace';

	const props = defineProps<{
		/** 路由追踪结果 */
		result: TraceResult | null;
		/** 是否正在追踪 */
		loading: boolean;
		/** 错误提示 */
		error: string;
	}>();

	const emit = defineEmits<{
		copy: [value: string, successText?: string];
		copyAll: [];
	}>();

	/** 有响应的跳中最大的平均延迟，用于延迟条的比例基准 */
	const latencyBase = computed(() => {
		const values = (props.result?.hops ?? [])
			.map((hop) => averageHopLatency(hop))
			.filter((value): value is number => typeof value === 'number');
		return values.length ? Math.max(...values, 1) : 1;
	});

	/** 延迟条宽度（无响应跳显示为满格灰色提示） */
	function barWidth(hop: TraceHop): string {
		const average = averageHopLatency(hop);
		if (average === null) return '100%';
		return `${Math.max(4, Math.round((average / latencyBase.value) * 100))}%`;
	}

	/** 一跳的状态标签 */
	function hopTagType(hop: TraceHop): 'success' | 'warning' | 'error' | 'default' {
		if (hop.reached) return 'success';
		if (hop.status === 'error') return 'error';
		if (hop.status === 'timeout') return 'warning';
		return 'default';
	}

	/** 一跳的状态文案 */
	function hopTagLabel(hop: TraceHop): string {
		if (hop.reached) return '目标';
		if (hop.status === 'error') return '异常';
		if (hop.status === 'timeout') return '无响应';
		return '正常';
	}
</script>

<template>
	<div>
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">跃点路径</span>
				<template v-if="props.result">
					<n-tag :bordered="false" round size="small">{{ props.result.hops.length }} 跳</n-tag>
					<n-tag :bordered="false" round size="small" type="info">IPv{{ props.result.family }}</n-tag>
					<n-tag :bordered="false" :type="props.result.reached ? 'success' : 'warning'" round size="small">
						{{ props.result.reached ? '已到达目标' : '未到达目标' }}
					</n-tag>
					<n-tag v-if="props.result.truncated" :bordered="false" round size="small" type="warning">
						超出时间预算，结果不完整
					</n-tag>
					<span class="text-xs text-slate-400">耗时 {{ props.result.durationMs }} ms</span>
				</template>
			</div>
			<n-button :disabled="!props.result?.hops.length" secondary size="small" @click="emit('copyAll')">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="14" />
					<span>复制全部路径</span>
				</span>
			</n-button>
		</div>

		<!-- 错误提示：主机无法解析 / 缺少命令 / 权限不足等 -->
		<n-alert v-if="props.error" class="mb-3 text-sm" type="error">{{ props.error }}</n-alert>

		<!-- 加载中 -->
		<div
			v-if="props.loading"
			class="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 py-10"
		>
			<n-spin size="small" />
			<span class="text-sm text-slate-400">正在逐跳探测网络路由…（无响应跳会等待超时）</span>
		</div>

		<div v-else-if="props.result?.hops.length" class="space-y-3">
			<!-- 概览：目标解析与统计 -->
			<div class="grid gap-2 sm:grid-cols-3">
				<div
					class="cursor-pointer rounded-lg bg-slate-50 px-3 py-2 transition hover:bg-slate-100"
					@click="emit('copy', props.result.ip, `已复制 ${props.result.ip}`)"
				>
					<div class="text-[11px] font-medium text-slate-400">目标</div>
					<div class="mt-0.5 truncate font-mono text-sm font-semibold text-slate-700">
						{{ props.result.host }} → {{ props.result.ip }}
					</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">跃点数 / 探测配置</div>
					<div class="mt-0.5 font-mono text-sm font-semibold text-slate-700">
						{{ props.result.hops.length }} 跳 / 每跳 {{ props.result.probes }} 次
					</div>
				</div>
				<div class="rounded-lg bg-slate-50 px-3 py-2">
					<div class="text-[11px] font-medium text-slate-400">执行命令</div>
					<div :title="props.result.command" class="mt-0.5 truncate font-mono text-xs text-slate-600">
						{{ props.result.command }}
					</div>
				</div>
			</div>

			<!-- 跃点时间线：跳数徽标 + 应答 IP + 逐次延迟 -->
			<div class="rounded-xl border border-slate-100 p-3">
				<div v-for="(hop, index) in props.result.hops" :key="hop.hop" class="flex gap-3">
					<div class="flex flex-col items-center">
						<span
							:class="
								hop.reached
									? 'bg-emerald-500 text-white'
									: hop.status === 'ok'
										? 'bg-blue-500 text-white'
										: hop.status === 'error'
											? 'bg-rose-500 text-white'
											: 'bg-slate-300 text-slate-600'
							"
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
						>
							{{ hop.hop }}
						</span>
						<span v-if="index < props.result.hops.length - 1" class="w-px flex-1 bg-slate-200" />
					</div>

					<div class="min-w-0 flex-1 pb-3">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="min-w-0">
								<div
									:title="hop.ip ? `点击复制 ${hop.ip}` : '该跳无应答'"
									class="cursor-pointer truncate font-mono text-sm text-slate-700"
									@click="hop.ip ? emit('copy', hop.ip, `已复制 ${hop.ip}`) : undefined"
								>
									{{ hop.ip ?? '*' }}
								</div>
								<div v-if="hop.hostname" class="truncate text-[11px] text-slate-400">
									{{ hop.hostname }}
								</div>
								<div v-if="hop.detail" class="mt-0.5 truncate text-[11px] text-amber-600">
									{{ hop.detail }}
								</div>
							</div>
							<div class="flex shrink-0 items-center gap-2">
								<span class="font-mono text-xs text-slate-500">{{ formatHopLatencies(hop) }}</span>
								<n-tag :bordered="false" :type="hopTagType(hop)" round size="tiny">
									{{ hopTagLabel(hop) }}
								</n-tag>
							</div>
						</div>
						<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
							<div
								:class="hop.reached ? 'bg-emerald-500' : hop.status === 'ok' ? 'bg-blue-500' : 'bg-slate-300'"
								:style="{ width: barWidth(hop) }"
								class="h-full rounded-full"
							/>
						</div>
						<div v-if="hop.probes.length > 1" class="mt-1 flex flex-wrap gap-3">
							<span
								v-for="(probe, probeIndex) in hop.probes"
								:key="probeIndex"
								class="font-mono text-[11px] text-slate-400"
							>
								#{{ probeIndex + 1 }} {{ formatProbeLatency(probe.latencyMs) }}
								<template v-if="probe.ip">← {{ probe.ip }}</template>
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 原始输出：便于排查跨平台解析差异 -->
			<n-collapse class="mt-1">
				<n-collapse-item name="raw" title="原始命令输出">
					<pre
						class="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900/95 p-3 font-mono text-[11px] leading-relaxed text-slate-100"
						>{{ props.result.raw }}</pre>
				</n-collapse-item>
			</n-collapse>
		</div>

		<!-- 结果占位：未追踪时保持结构稳定 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入目标并点击开始追踪，逐跳路径将显示在这里</p>
		</div>

		<p v-if="props.result" class="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
			<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0" />
			<span>
				追踪由部署服务器发起；出现 * 的跳不代表链路中断（部分路由器不回送 ICMP），请结合前后跳的延迟变化判断。
			</span>
		</p>
	</div>
</template>
