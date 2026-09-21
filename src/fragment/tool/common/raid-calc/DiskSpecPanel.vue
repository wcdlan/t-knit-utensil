<script lang="ts" setup>
	import { computed } from 'vue';
	import { NSelect } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { DISK_INTERFACES, formatByteCount, formatSpeed, getRaidInterface } from '@/utils/raid';
	import MetricRow from '@/fragment/tool/common/raid-calc/MetricRow.vue';
	import type { RaidCapacity, RaidInterfaceId } from '@/types/raid';

	const props = defineProps<{
		/** 单块硬盘标称容量 */
		diskCapacity: RaidCapacity;
		/** 单块硬盘在阵列中的有效容量贡献（可用容量 ÷ 阵列磁盘数） */
		perDiskUsable: RaidCapacity;
		/** 阵列磁盘数（参与读并行的磁盘） */
		arrayDisks: number;
		/** 数据盘数量（参与写并行的磁盘） */
		dataDisks: number;
		/** 当前选择的硬盘接口 */
		interfaceId: RaidInterfaceId;
		/** 阵列顺序读聚合带宽（MB/s） */
		readSpeed: number;
		/** 阵列顺序写聚合带宽（MB/s） */
		writeSpeed: number;
		/** 当前等级配置是否可用（不可用时带宽显示占位） */
		valid: boolean;
	}>();

	const emit = defineEmits<{
		'update:interfaceId': [value: RaidInterfaceId];
		copy: [value: string];
	}>();

	/** 接口下拉选项（label 使用接口名，形态与说明在面板内展示） */
	const interfaceOptions = computed(() => DISK_INTERFACES.map((item) => ({ label: item.name, value: item.id })));

	/** 当前接口规格 */
	const current = computed(() => getRaidInterface(props.interfaceId));
</script>

<template>
	<div class="shrink-0 rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.harddisk" :size="15" class="text-slate-500" />
				<span class="text-sm font-semibold text-slate-700">硬盘与接口参数</span>
				<span class="text-[10px] text-slate-400">单盘容量换算与链路带宽估算</span>
			</div>
			<span class="font-mono text-[10px] text-slate-400">{{ current.alias }}</span>
		</div>

		<div class="grid gap-3 xl:grid-cols-2">
			<!-- 单块硬盘：容量参数（标称 / 实际 / 字节数 / 阵列中的有效贡献） -->
			<section>
				<div class="mb-1.5 flex items-center gap-2">
					<span class="shrink-0 text-[11px] font-semibold text-slate-500">单块硬盘</span>
					<span class="h-px flex-1 bg-slate-100" />
				</div>
				<div class="grid gap-1.5 sm:grid-cols-2">
					<MetricRow :value="diskCapacity.decimal" label="标称容量" mono @copy="(v: string) => emit('copy', v)" />
					<MetricRow :value="diskCapacity.binary" label="系统实际容量" mono @copy="(v: string) => emit('copy', v)" />
					<MetricRow
						:value="formatByteCount(diskCapacity.bytes)"
						label="字节数"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:value="valid ? perDiskUsable.decimal : '—'"
						label="阵列中有效贡献"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
				</div>
			</section>

			<!-- 接口与链路：接口类型 + 单盘带宽 + 阵列聚合带宽 -->
			<section>
				<div class="mb-1.5 flex items-center justify-between gap-2">
					<span class="shrink-0 text-[11px] font-semibold text-slate-500">接口与链路</span>
					<n-select
						:options="interfaceOptions"
						:value="interfaceId"
						class="!w-[150px]"
						size="tiny"
						@update:value="(v: RaidInterfaceId) => emit('update:interfaceId', v)"
					/>
				</div>
				<div class="grid gap-1.5 sm:grid-cols-2">
					<MetricRow
						:value="formatSpeed(current.linkSpeed)"
						label="单盘链路带宽"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:value="formatSpeed(current.effectiveSpeed)"
						label="单盘实测带宽"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:label="`阵列读聚合（${valid ? arrayDisks : 0} 盘并行）`"
						:value="formatSpeed(readSpeed)"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:label="`阵列写聚合（${valid ? dataDisks : 0} 盘并行）`"
						:value="formatSpeed(writeSpeed)"
						mono
						@copy="(v: string) => emit('copy', v)"
					/>
				</div>
				<p class="mt-1.5 text-[10px] leading-relaxed text-slate-400">
					{{ current.hint }}；聚合带宽为顺序读写理论值，实际受控制器 / 背板 / 网络与随机 IO 影响，RAID 5 / 6
					的随机写还有校验惩罚。
				</p>
			</section>
		</div>
	</div>
</template>
