<script lang="ts" setup>
	import { NButton, NTag } from 'naive-ui';
	import type { SubnetEntry } from '@/types/ip';

	defineProps<{
		subnets: SubnetEntry[];
		truncated: boolean;
		total: number | string;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();

	/** 子网总数格式化（IPv6 可能超出安全整数范围而为 string） */
	function formatTotal(total: number | string): string {
		const num = Number(total);
		if (Number.isFinite(num) && num <= Number.MAX_SAFE_INTEGER) {
			return num.toLocaleString('zh-CN');
		}
		return total.toString();
	}
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">子网清单</label>
			<div class="flex items-center gap-2">
				<n-tag v-if="truncated" round size="small" type="warning">
					共 {{ formatTotal(total) }} 个，仅显示前 {{ subnets.length }} 个
				</n-tag>
				<n-tag v-else round size="small" type="info"> 共 {{ formatTotal(total) }} 个 </n-tag>
			</div>
		</div>

		<!-- 子网列表：大量数据时限制高度滚动 -->
		<div class="max-h-96 overflow-auto rounded-xl border border-slate-100">
			<table class="w-full text-left text-sm">
				<thead class="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
					<tr>
						<th class="px-3 py-2 font-medium">#</th>
						<th class="px-3 py-2 font-medium">网络地址</th>
						<th class="px-3 py-2 font-medium">地址范围</th>
						<th v-if="subnets[0]?.broadcast" class="px-3 py-2 font-medium">广播地址</th>
						<th class="px-3 py-2 font-medium">主机数</th>
						<th class="px-3 py-2 font-medium" />
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					<tr v-for="s in subnets" :key="s.index" class="group hover:bg-blue-50/50">
						<td class="px-3 py-2 font-mono text-xs text-slate-400">{{ s.index }}</td>
						<td class="px-3 py-2 font-mono text-slate-700">{{ s.network }}</td>
						<td class="px-3 py-2 font-mono text-xs text-slate-500">{{ s.range }}</td>
						<td v-if="s.broadcast" class="px-3 py-2 font-mono text-xs text-slate-500">{{ s.broadcast }}</td>
						<td class="px-3 py-2 font-mono text-xs text-slate-500">{{ s.hosts }}</td>
						<td class="px-2 py-2 text-right">
							<n-button
								class="opacity-0 transition group-hover:opacity-100"
								secondary
								size="tiny"
								@click="emit('copy', s.network)"
							>
								复制
							</n-button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
