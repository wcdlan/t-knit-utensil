<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NInputNumber, NSelect } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { DISK_COUNT_PRESETS, DISK_UNIT_OPTIONS } from '@/utils/raid';
	import type { RaidDiskUnit } from '@/types/raid';

	const props = defineProps<{
		/** 单盘容量数值 */
		diskSize: number;
		/** 单盘容量单位 */
		diskUnit: RaidDiskUnit;
		/** 总磁盘数（含热备盘） */
		diskCount: number;
	}>();

	const emit = defineEmits<{
		'update:diskSize': [value: number];
		'update:diskUnit': [value: RaidDiskUnit];
		'update:diskCount': [value: number];
	}>();

	/** 当前单位的进制说明（如 十进制 10¹²） */
	const unitHint = computed(() => DISK_UNIT_OPTIONS.find((item) => item.value === props.diskUnit)?.hint ?? '');

	/** 下拉选项：仅保留 label / value，避免多余字段与 Naive UI 的选项类型冲突 */
	const unitOptions = computed(() => DISK_UNIT_OPTIONS.map((item) => ({ label: item.label, value: item.value })));
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
		<div class="mb-2 flex items-center gap-2">
			<TkuIcon :name="icons.harddisk" :size="15" class="text-blue-500" />
			<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">磁盘配置</span>
		</div>

		<!-- 表单行：标签左、控件右，避免宽屏下拉散 -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between gap-2">
				<span class="shrink-0 text-xs text-slate-500">单盘容量</span>
				<div class="flex items-center gap-1.5">
					<n-input-number
						:min="0.1"
						:precision="2"
						:step="1"
						:value="diskSize"
						class="!w-[112px]"
						size="small"
						@update:value="(v: number | null) => emit('update:diskSize', v ?? 1)"
					/>
					<n-select
						:options="unitOptions"
						:value="diskUnit"
						class="!w-[80px]"
						size="small"
						@update:value="(v: RaidDiskUnit) => emit('update:diskUnit', v)"
					/>
				</div>
			</div>
			<p class="text-right text-xs text-slate-400">{{ diskUnit }} = {{ unitHint }}</p>

			<div class="flex items-center justify-between gap-2">
				<span class="shrink-0 text-xs text-slate-500">磁盘总数（含热备）</span>
				<div class="flex items-center gap-1.5">
					<n-input-number
						:max="256"
						:min="1"
						:precision="0"
						:step="1"
						:value="diskCount"
						class="!w-[112px]"
						size="small"
						@update:value="(v: number | null) => emit('update:diskCount', v ?? 1)"
					/>
					<span class="text-xs text-slate-400">块</span>
				</div>
			</div>
			<p class="text-right text-xs text-slate-400">阵列磁盘 = 总数 − 热备盘</p>
		</div>

		<!-- 常见盘位快捷预设：一键套用主流机型盘数 -->
		<div class="mt-2 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-2">
			<span class="shrink-0 text-xs text-slate-400">常见盘位</span>
			<div class="flex flex-wrap justify-end gap-1">
				<n-button
					v-for="preset in DISK_COUNT_PRESETS"
					:key="preset.count"
					:title="preset.hint"
					:type="diskCount === preset.count ? 'primary' : 'default'"
					size="tiny"
					@click="emit('update:diskCount', preset.count)"
				>
					{{ preset.count }}
				</n-button>
			</div>
		</div>
	</div>
</template>
