<script lang="ts" setup>
	import { NButton, NSwitch, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { formatPercent, RAID_CATEGORY_LABELS, RAID_CATEGORY_TAG_TYPES } from '@/utils/raid';
	import type { RaidCalcResult, RaidLevelId, RaidLevelMeta } from '@/types/raid';

	const props = defineProps<{
		/** 全部等级在当前磁盘配置下的计算结果 */
		results: RaidCalcResult[];
		/** 全部等级元信息（用于展示不可用等级的最低磁盘要求） */
		levels: RaidLevelMeta[];
		/** 当前选中的等级 */
		selected: RaidLevelId;
		/** 是否只展示可用等级 */
		availableOnly: boolean;
	}>();

	const emit = defineEmits<{
		select: [value: RaidLevelId];
		'update:availableOnly': [value: boolean];
		'copy-all': [];
	}>();

	/** 磁盘结构描述：可用时展示实际结构，不可用时展示该等级的最低磁盘要求 */
	function structure(result: RaidCalcResult): string {
		if (!result.valid) {
			const meta = props.levels.find((item) => item.id === result.level);
			if (!meta) return '磁盘数不足';
			const extra = `${meta.evenOnly ? '、偶数' : ''}${meta.needsSpan ? '、配子组' : ''}`;
			return `需 ≥${meta.minDisks} 盘${extra}`;
		}
		return result.spans > 1 ? `${result.spans} 组 × ${result.spanDisks} 块` : `${result.arrayDisks} 块`;
	}
</script>

<template>
	<!-- 宽屏下由父级赋予 flex-1：表格区域拉伸撑满右栏剩余高度 -->
	<div class="rounded-xl border border-slate-200 bg-white p-4 lg:flex lg:min-h-0 lg:flex-col">
		<div class="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.chart" :size="15" class="text-blue-500" />
				<span class="text-sm font-semibold text-slate-700">全等级容量对比</span>
				<span class="text-[10px] text-slate-400">同一磁盘配置下各等级的容量与容错差异</span>
			</div>
			<div class="flex items-center gap-3">
				<label class="flex items-center gap-2 text-[11px] text-slate-500">
					只看可用
					<n-switch
						:value="availableOnly"
						size="small"
						@update:value="(v: boolean) => emit('update:availableOnly', v)"
					/>
				</label>
				<n-button secondary size="tiny" @click="emit('copy-all')">复制对比表</n-button>
			</div>
		</div>

		<div class="max-h-[440px] overflow-auto rounded-lg border border-slate-100 lg:max-h-none lg:min-h-0 lg:flex-1">
			<table class="w-full text-left text-sm">
				<thead class="sticky top-0 z-10 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
					<tr>
						<th class="px-2.5 py-1.5 font-medium">等级</th>
						<th class="px-2.5 py-1.5 font-medium">分类</th>
						<th class="px-2.5 py-1.5 font-medium">磁盘结构</th>
						<th class="px-2.5 py-1.5 font-medium">可用容量</th>
						<th class="px-2.5 py-1.5 font-medium">利用率</th>
						<th class="px-2.5 py-1.5 font-medium">容错</th>
						<th class="px-2.5 py-1.5 font-medium" />
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					<tr
						v-for="result in results"
						:key="result.level"
						:class="selected === result.level ? 'bg-blue-50/70' : 'hover:bg-slate-50'"
						class="cursor-pointer transition"
						@click="emit('select', result.level)"
					>
						<td class="px-2.5 py-1.5">
							<div class="flex items-center gap-1.5">
								<span class="text-[13px] font-semibold text-slate-700">{{ result.name }}</span>
								<n-tag v-if="selected === result.level" round size="tiny" type="primary">当前</n-tag>
							</div>
						</td>
						<td class="px-2.5 py-1.5">
							<n-tag :type="RAID_CATEGORY_TAG_TYPES[result.category]" round size="tiny">
								{{ RAID_CATEGORY_LABELS[result.category] }}
							</n-tag>
						</td>
						<td class="px-2.5 py-1.5 font-mono text-[11px] text-slate-500">{{ structure(result) }}</td>
						<td class="px-2.5 py-1.5 font-mono text-[11px]">
							<span v-if="result.valid" class="font-semibold text-slate-700">{{ result.usable.decimal }}</span>
							<span v-else class="text-red-500">—</span>
						</td>
						<td class="px-2.5 py-1.5 font-mono text-[11px] text-slate-500">
							{{ result.valid ? formatPercent(result.efficiency) : '—' }}
						</td>
						<td class="px-2.5 py-1.5">
							<span v-if="result.valid" :title="result.faultText" class="text-[11px] text-slate-600">
								{{ result.faultTolerance > 0 ? `${result.faultTolerance} 块` : '无冗余' }}
							</span>
							<span v-else :title="result.reason" class="text-[11px] text-red-500">盘数不足</span>
						</td>
						<td class="px-2 py-1.5 text-right">
							<n-button secondary size="tiny" @click.stop="emit('select', result.level)">选用</n-button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="mt-1.5 text-[10px] leading-relaxed text-slate-400">
			「容错」表示允许同时损坏的磁盘数；SHR / SHR-2
			按等容量磁盘计算，混合容量磁盘的实际可用容量会更高（按最小盘为基准逐层冗余）。
		</p>
	</div>
</template>
