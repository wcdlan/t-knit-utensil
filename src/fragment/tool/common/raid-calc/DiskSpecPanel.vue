<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NInputNumber, NSelect } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import {
		DISK_INTERFACES,
		DISK_SPEED_PRESETS,
		formatByteCount,
		formatSpeed,
		getRaidInterface,
		RAID_BOTTLENECK_LABELS
	} from '@/utils/raid';
	import MetricRow from '@/fragment/tool/common/raid-calc/MetricRow.vue';
	import type { RaidCapacity, RaidInterfaceId, RaidSpeedLimit } from '@/types/raid';

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
		/** 单盘实测速度（MB/s，用户输入） */
		diskSpeed: number;
		/** 单盘速度综合结果（有效速度与瓶颈） */
		speedLimit: RaidSpeedLimit;
		/** 阵列顺序读聚合带宽（MB/s） */
		readSpeed: number;
		/** 阵列顺序写聚合带宽（MB/s） */
		writeSpeed: number;
		/** 当前等级配置是否可用（不可用时带宽显示占位） */
		valid: boolean;
	}>();

	const emit = defineEmits<{
		'update:interfaceId': [value: RaidInterfaceId];
		'update:diskSpeed': [value: number];
		copy: [value: string];
	}>();

	/** 接口下拉选项（label 使用接口名，形态与说明在面板内展示） */
	const interfaceOptions = computed(() => DISK_INTERFACES.map((item) => ({ label: item.name, value: item.id })));

	/** 当前接口规格 */
	const current = computed(() => getRaidInterface(props.interfaceId));

	/** 瓶颈说明（短文案；具体数值在下方说明段落给出，避免指标行被截断） */
	const bottleneckText = computed(() => RAID_BOTTLENECK_LABELS[props.speedLimit.bottleneck]);
</script>

<template>
	<div class="shrink-0 rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.harddisk" :size="15" class="text-slate-500" />
				<span class="text-sm font-semibold text-slate-700">硬盘与接口参数</span>
				<span class="text-xs text-slate-400">单盘容量换算与读写速度估算</span>
			</div>
			<span class="font-mono text-xs text-slate-400">{{ current.alias }}</span>
		</div>

		<div class="grid gap-3 xl:grid-cols-2">
			<!-- 单块硬盘：容量参数（标称 / 实际 / 字节数 / 阵列中的有效贡献）+ 换算与估算说明 -->
			<section class="flex flex-col">
				<div class="mb-1.5 flex items-center gap-2">
					<span class="shrink-0 text-xs font-semibold text-slate-500">单块硬盘</span>
					<span class="h-px flex-1 bg-slate-100" />
				</div>
				<div class="grid gap-1.5 sm:grid-cols-2">
					<MetricRow :value="diskCapacity.decimal" label="标称容量" mono @copy="(v: string) => emit('copy', v)" />
					<MetricRow :value="diskCapacity.binary" label="系统实际容量" mono @copy="(v: string) => emit('copy', v)" />
					<MetricRow
						label="字节数"
						mono
						:value="formatByteCount(diskCapacity.bytes)"
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						label="阵列中有效贡献"
						mono
						:value="valid ? perDiskUsable.decimal : '—'"
						@copy="(v: string) => emit('copy', v)"
					/>
				</div>

				<!-- 说明区：填充左栏留白，解释容量换算与速度估算口径 -->
				<div class="mt-3 space-y-1.5 rounded-lg bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-400">
					<p>
						<strong class="text-slate-500">容量换算：</strong>硬盘标称容量按 10¹² 计（1 TB = 1000 GB），操作系统按 2⁴⁰
						计（1 TiB），因此 4 TB 在系统中显示为 3.64 TiB；「阵列中有效贡献」= 可用容量 ÷ 阵列磁盘数。
					</p>
					<p>
						<strong class="text-slate-500">速度估算：</strong>单盘有效速度取「实测速度」与「链路可用带宽」的较小值 ——
						机械盘通常跑不满接口带宽（受磁盘本身限制），SSD
						则常被接口带宽限制。阵列聚合带宽为顺序读写理论值（读按阵列磁盘数、写按数据盘数并行）， 实际还受控制器 / 背板
						/ 网络与随机 IO 影响，RAID 5 / 6 的随机写另有校验惩罚。
					</p>
				</div>
			</section>

			<!-- 接口与链路：接口类型 + 单盘实测速度 + 链路带宽 + 阵列聚合带宽 -->
			<section>
				<div class="mb-1.5 flex items-center justify-between gap-2">
					<span class="shrink-0 text-xs font-semibold text-slate-500">接口与链路</span>
					<n-select
						:options="interfaceOptions"
						:value="interfaceId"
						class="!w-[150px]"
						size="tiny"
						@update:value="(v: RaidInterfaceId) => emit('update:interfaceId', v)"
					/>
				</div>

				<!-- 单盘实测速度：可自行填写（机械盘跑不满带宽，SSD 可能被带宽限制） -->
				<div class="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
					<span class="shrink-0 text-xs font-medium text-slate-400">单盘实测速度</span>
					<div class="flex items-center gap-1.5">
						<n-input-number
							:max="20000"
							:min="1"
							:precision="0"
							:step="50"
							:value="diskSpeed"
							class="!w-[104px]"
							size="tiny"
							@update:value="(v: number | null) => emit('update:diskSpeed', v ?? 1)"
						/>
						<span class="text-xs text-slate-400">MB/s</span>
					</div>
				</div>

				<!-- 常见介质快捷预设：一键填入典型顺序速度 -->
				<div class="mt-1.5 flex flex-wrap gap-1">
					<n-button
						v-for="preset in DISK_SPEED_PRESETS"
						:key="preset.label"
						:title="preset.hint"
						:type="diskSpeed === preset.speed ? 'primary' : 'default'"
						size="tiny"
						@click="emit('update:diskSpeed', preset.speed)"
					>
						{{ preset.label }} {{ preset.speed }}
					</n-button>
				</div>

				<div class="mt-1.5 grid gap-1.5 sm:grid-cols-2">
					<MetricRow
						:value="formatSpeed(speedLimit.linkSpeed)"
						mono
						label="链路可用带宽"
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:value="formatSpeed(speedLimit.effectiveSpeed)"
						mono
						label="单盘有效速度"
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow :value="bottleneckText" label="速度瓶颈" @copy="(v: string) => emit('copy', v)" />
					<MetricRow
						:label="`阵列读聚合（${valid ? arrayDisks : 0} 盘并行）`"
						mono
						:value="formatSpeed(readSpeed)"
						@copy="(v: string) => emit('copy', v)"
					/>
					<MetricRow
						:label="`阵列写聚合（${valid ? dataDisks : 0} 盘并行）`"
						mono
						:value="formatSpeed(writeSpeed)"
						@copy="(v: string) => emit('copy', v)"
					/>
				</div>

				<!-- 当前取值速览：把有效速度与瓶颈数值贴在本栏底部，说明文字见左栏 -->
				<p class="mt-2 rounded-lg bg-slate-50/70 px-3 py-2 text-xs leading-relaxed text-slate-500">
					当前单盘有效速度
					<span class="font-mono font-semibold text-slate-700">{{ formatSpeed(speedLimit.effectiveSpeed) }}</span>
					，{{ bottleneckText }}（实测 {{ formatSpeed(speedLimit.diskSpeed) }} / 链路
					{{ formatSpeed(speedLimit.linkSpeed) }}）。
				</p>
			</section>
		</div>
	</div>
</template>
