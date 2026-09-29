<script lang="ts" setup>
	import { NAlert, NButton, NSpin, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { formatTtl } from '@/utils/dns';
	import type { DnsLookupType, DnsResolveResult } from '@/types/dns';

	const props = defineProps<{
		/** 解析结果 */
		result: DnsResolveResult | null;
		/** 是否正在查询 */
		loading: boolean;
		/** 错误提示 */
		error: string;
		/** 当前记录类型（决定是否展示优先级列） */
		type: DnsLookupType;
	}>();

	const emit = defineEmits<{
		copy: [value: string, successText?: string];
		copyAll: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">解析结果</span>
				<template v-if="props.result">
					<n-tag :bordered="false" round size="small">{{ props.result.records.length }} 条记录</n-tag>
					<span class="text-xs text-slate-400">耗时 {{ props.result.durationMs }} ms</span>
					<span class="font-mono text-xs text-slate-400">via {{ props.result.server }}</span>
				</template>
			</div>
			<n-button :disabled="!props.result?.records.length" secondary size="small" @click="emit('copyAll')">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="14" />
					<span>复制全部记录值</span>
				</span>
			</n-button>
		</div>

		<!-- 错误提示：域名不存在 / 无该类型记录 / DNS 超时等 -->
		<n-alert v-if="props.error" class="mb-3 text-sm" type="error">{{ props.error }}</n-alert>

		<!-- 加载中 -->
		<div
			v-if="props.loading"
			class="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 py-10"
		>
			<n-spin size="small" />
			<span class="text-sm text-slate-400">正在向 DNS 服务器查询…</span>
		</div>

		<!-- 记录表格：点击记录值即可复制 -->
		<div v-else-if="props.result?.records.length" class="overflow-hidden rounded-xl border border-slate-100">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
					<tr>
						<th class="px-3 py-2 font-medium">#</th>
						<th class="px-3 py-2 font-medium">记录值</th>
						<th class="px-3 py-2 font-medium">TTL</th>
						<th v-if="props.type === 'MX'" class="px-3 py-2 font-medium">优先级</th>
						<th class="px-2 py-2" />
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					<tr
						v-for="(record, index) in props.result.records"
						:key="`${index}-${record.value}`"
						class="group hover:bg-blue-50/50"
					>
						<td class="px-3 py-2 font-mono text-xs text-slate-400">{{ index + 1 }}</td>
						<td class="cursor-pointer break-all px-3 py-2 font-mono text-slate-700" @click="emit('copy', record.value)">
							{{ record.value }}
						</td>
						<td class="px-3 py-2 font-mono text-xs text-slate-500">{{ formatTtl(record.ttl) }}</td>
						<td v-if="props.type === 'MX'" class="px-3 py-2 font-mono text-xs text-slate-500">
							{{ record.priority ?? 0 }}
						</td>
						<td class="px-2 py-2 text-right">
							<n-button
								class="opacity-0 transition group-hover:opacity-100"
								secondary
								size="tiny"
								@click="emit('copy', record.value)"
							>
								复制
							</n-button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 查询成功但没有记录 -->
		<n-alert v-else-if="props.result" class="text-sm" type="info">
			域名存在，但没有查询到 {{ props.type }} 记录。
		</n-alert>

		<!-- 结果占位：未查询时保持结构稳定 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入域名并点击查询，解析结果将显示在这里</p>
		</div>

		<p v-if="props.result?.servers.length" class="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
			<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0" />
			<span>本次查询使用的 DNS 服务器：{{ props.result.servers.join('、') }}</span>
		</p>
	</div>
</template>
