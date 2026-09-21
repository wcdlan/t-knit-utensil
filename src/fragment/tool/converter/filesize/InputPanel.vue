<script lang="ts" setup>
	import { NButton, NInputNumber, NRadio, NRadioGroup } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { FILE_SIZE_MAGNITUDES, getUnit, resolveUnitId } from '@/utils/filesize';
	import type { FileSizeBase, FileSizeMagnitude, FileSizeUnitId } from '@/types/filesize';

	const props = defineProps<{
		/** 输入的数值 */
		amount: number | null;
		/** 输入数值的量级 */
		magnitude: FileSizeMagnitude;
		/** 换算标准（1000 / 1024 进制） */
		base: FileSizeBase;
		/** 小数位数 */
		precision: number;
		/** 当前单位的完整说明 */
		unitHint: string;
		/** 实时换算等式（如 1 GB = 1,000,000,000 B） */
		preview: string;
	}>();

	const emit = defineEmits<{
		'update:amount': [value: number | null];
		'update:magnitude': [value: FileSizeMagnitude];
		'update:base': [value: FileSizeBase];
		'update:precision': [value: number];
		applySample: [amount: number, unit: FileSizeUnitId];
		scale: [factor: number];
		clear: [];
	}>();

	/** 换算标准选项（单选） */
	const baseOptions = [
		{
			label: '十进制（1000 进制）',
			value: 1000 as FileSizeBase,
			hint: 'KB / MB / GB 之间按 1000 递进，硬盘与网络标称使用'
		},
		{
			label: '二进制（1024 进制）',
			value: 1024 as FileSizeBase,
			hint: 'KiB / MiB / GiB 之间按 1024 递进，操作系统显示使用'
		}
	];

	/** 小数位数选项（单选） */
	const precisionOptions = [0, 1, 2, 3, 4, 6, 8];

	/** 数值快捷倍率（按 1000 / 1024 两套标准互相跳转） */
	const scaleActions = [
		{ label: '×1000', factor: 1000 },
		{ label: '×1024', factor: 1024 },
		{ label: '÷1000', factor: 1 / 1000 },
		{ label: '÷1024', factor: 1 / 1024 }
	];

	/** 常见容量示例（一键填入数值与单位） */
	const samples = [
		{ label: '1 KB', amount: 1, unit: 'KB' as FileSizeUnitId },
		{ label: '1 KiB', amount: 1, unit: 'KiB' as FileSizeUnitId },
		{ label: '1.44 MB（软盘）', amount: 1.44, unit: 'MB' as FileSizeUnitId },
		{ label: '700 MB（CD）', amount: 700, unit: 'MB' as FileSizeUnitId },
		{ label: '4.7 GB（DVD）', amount: 4.7, unit: 'GB' as FileSizeUnitId },
		{ label: '25 GB（蓝光）', amount: 25, unit: 'GB' as FileSizeUnitId },
		{ label: '1 TiB', amount: 1, unit: 'TiB' as FileSizeUnitId }
	];

	/** 某量级在当前换算标准下的单位符号（如 千 → KB / KiB） */
	function symbolOf(magnitude: FileSizeMagnitude): string {
		return getUnit(resolveUnitId(magnitude, props.base)).symbol;
	}

	/** 某量级在当前换算标准下的说明 */
	function hintOf(magnitude: FileSizeMagnitude): string {
		const unit = getUnit(resolveUnitId(magnitude, props.base));
		return `${unit.symbol} · ${unit.name} · ${unit.hint}`;
	}
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.filesize" :size="16" class="text-blue-500" />
				<h3 class="text-sm font-semibold text-slate-800">容量输入</h3>
			</div>
			<!-- 清空输入 -->
			<n-button secondary size="tiny" @click="emit('clear')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.close" :size="14" />
					<span>清空</span>
				</span>
			</n-button>
		</div>

		<!-- 数值：输入框 + 快捷倍率按钮 -->
		<div class="mb-3">
			<label class="mb-1 block text-xs font-semibold text-slate-500">数值</label>
			<div class="flex flex-wrap items-center gap-2">
				<n-input-number
					:min="0"
					:show-button="false"
					:value="props.amount"
					class="!w-[180px]"
					placeholder="如 1.5"
					@update:value="(v: number | null) => emit('update:amount', v)"
				/>
				<div class="flex flex-wrap items-center gap-1">
					<button
						v-for="action in scaleActions"
						:key="action.label"
						:title="`当前数值 ${action.label}`"
						class="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
						type="button"
						@click="emit('scale', action.factor)"
					>
						{{ action.label }}
					</button>
					<button
						class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
						title="数值重置为 1"
						type="button"
						@click="emit('update:amount', 1)"
					>
						重置为 1
					</button>
				</div>
			</div>
		</div>

		<!-- 换算标准：十进制（1000） / 二进制（1024）单选 -->
		<div class="mb-3 border-t border-slate-100 pt-3">
			<div class="mb-1.5 flex flex-wrap items-baseline gap-2">
				<span class="text-xs font-semibold text-slate-500">换算标准</span>
				<span class="text-[11px] text-slate-400">
					{{ props.base === 1000 ? '1 KB = 1000 B，硬盘 / 网络标称' : '1 KiB = 1024 B，操作系统显示' }}
				</span>
			</div>
			<n-radio-group :value="props.base" @update:value="(v: FileSizeBase) => emit('update:base', v)">
				<div class="flex flex-wrap gap-x-5 gap-y-2">
					<n-radio v-for="item in baseOptions" :key="item.value" :title="item.hint" :value="item.value">
						<span class="text-xs text-slate-700">{{ item.label }}</span>
					</n-radio>
				</div>
			</n-radio-group>
		</div>

		<!-- 单位量级：单选，符号随换算标准自动切换 -->
		<div class="mb-3 border-t border-slate-100 pt-3">
			<div class="mb-1.5 flex flex-wrap items-baseline gap-2">
				<span class="text-xs font-semibold text-slate-500">单位</span>
				<span class="text-[11px] text-slate-400">比特与字节不区分进制</span>
			</div>
			<n-radio-group :value="props.magnitude" @update:value="(v: FileSizeMagnitude) => emit('update:magnitude', v)">
				<div class="flex flex-wrap gap-x-5 gap-y-2">
					<n-radio
						v-for="item in FILE_SIZE_MAGNITUDES"
						:key="item.magnitude"
						:title="hintOf(item.magnitude)"
						:value="item.magnitude"
					>
						<span class="font-mono text-xs text-slate-700">{{ symbolOf(item.magnitude) }}</span>
					</n-radio>
				</div>
			</n-radio-group>
			<div class="mt-1.5 text-[11px] text-slate-400">{{ props.unitHint }}</div>
		</div>

		<!-- 小数位数：单选 -->
		<div class="mb-3 border-t border-slate-100 pt-3">
			<div class="mb-1.5 text-xs font-semibold text-slate-500">小数位数</div>
			<n-radio-group :value="props.precision" @update:value="(v: number) => emit('update:precision', v)">
				<div class="flex flex-wrap gap-x-5 gap-y-2">
					<n-radio v-for="item in precisionOptions" :key="item" :value="item">
						<span class="font-mono text-xs text-slate-700">{{ item }}</span>
					</n-radio>
				</div>
			</n-radio-group>
		</div>

		<!-- 实时换算等式：随数值 / 单位 / 精度即时更新 -->
		<div class="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
			<div class="text-[11px] font-semibold text-blue-700">当前输入</div>
			<div class="mt-0.5 break-all font-mono text-sm text-blue-800">{{ props.preview }}</div>
		</div>

		<!-- 常见容量示例：点击即填入数值与单位 -->
		<div class="mt-3 border-t border-slate-100 pt-2.5">
			<div class="mb-1.5 text-xs font-semibold text-slate-500">常见示例</div>
			<div class="flex flex-wrap gap-1.5">
				<button
					v-for="sample in samples"
					:key="sample.label"
					class="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
					type="button"
					@click="emit('applySample', sample.amount, sample.unit)"
				>
					{{ sample.label }}
				</button>
			</div>
		</div>
	</div>
</template>
