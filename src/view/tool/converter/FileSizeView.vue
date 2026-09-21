<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import {
		buildReferenceRows,
		buildRows,
		buildRowsText,
		buildSummary,
		formatUnitValue,
		getMagnitude,
		getUnit,
		resolveUnitId,
		toBits
	} from '@/utils/filesize';
	import type { FileSizeBase, FileSizeMagnitude, FileSizeUnitId } from '@/types/filesize';
	import AboutPanel from '@/fragment/tool/converter/filesize/AboutPanel.vue';
	import InputPanel from '@/fragment/tool/converter/filesize/InputPanel.vue';
	import SummaryPanel from '@/fragment/tool/converter/filesize/SummaryPanel.vue';
	import UnitTable from '@/fragment/tool/converter/filesize/UnitTable.vue';
	import DiskReference from '@/fragment/tool/converter/filesize/DiskReference.vue';

	/** 默认输入数值 */
	const DEFAULT_AMOUNT = 1;
	/** 默认量级：1 GB 是最常见的换算起点 */
	const DEFAULT_MAGNITUDE: FileSizeMagnitude = 'G';
	/** 默认换算标准：十进制（1000 进制） */
	const DEFAULT_BASE: FileSizeBase = 1000;
	/** 默认小数位数 */
	const DEFAULT_PRECISION = 4;

	/** 输入数值 */
	const amount = ref<number | null>(DEFAULT_AMOUNT);
	/** 输入量级 */
	const magnitude = ref<FileSizeMagnitude>(DEFAULT_MAGNITUDE);
	/** 换算标准 */
	const base = ref<FileSizeBase>(DEFAULT_BASE);
	/** 小数位数 */
	const precision = ref(DEFAULT_PRECISION);

	/** 当前单位：由「量级 + 换算标准」推导 */
	const unit = computed(() => resolveUnitId(magnitude.value, base.value));
	/** 当前单位元信息 */
	const unitMeta = computed(() => getUnit(unit.value));
	/** 输入值折算为比特总数（空值 / 非法值按 0 处理） */
	const bits = computed(() => {
		const value = amount.value;
		if (value === null || !Number.isFinite(value) || value < 0) return 0;
		return toBits(value, unit.value);
	});

	/** 各量级换算结果与基准值摘要 */
	const rows = computed(() => buildRows(bits.value, precision.value));
	const summary = computed(() => buildSummary(bits.value, precision.value));
	/** 硬盘标称容量对照（静态数据，只生成一次） */
	const referenceRows = buildReferenceRows();
	/** 当前单位说明与复制用的输入描述 */
	const unitHint = computed(
		() => `当前单位：${unitMeta.value.symbol} · ${unitMeta.value.name} · ${unitMeta.value.hint}`
	);
	const inputText = computed(() => `${amount.value ?? 0} ${unitMeta.value.symbol}`);
	/** 实时换算等式：输入值 = 字节数 = 比特数 */
	const preview = computed(
		() =>
			`${inputText.value} = ${formatUnitValue(bits.value, 'B', precision.value)} B = ` +
			`${formatUnitValue(bits.value, 'bit', precision.value)} bit`
	);

	/** 填入常见容量示例（同时切换到该单位所属的量级与换算标准） */
	function applySample(sampleAmount: number, sampleUnit: FileSizeUnitId) {
		amount.value = sampleAmount;
		magnitude.value = getMagnitude(sampleUnit).magnitude;
		base.value = getUnit(sampleUnit).base;
	}

	/** 数值快捷倍率（×1000 / ×1024 / ÷1000 / ÷1024），保留 12 位有效数字避免浮点误差 */
	function scaleAmount(factor: number) {
		const current = amount.value ?? 0;
		amount.value = Number.parseFloat((current * factor).toPrecision(12));
	}

	function clear() {
		amount.value = null;
	}

	function copy(value: string) {
		if (!value) return;
		copyToClipboard(value);
	}

	/** 复制全部换算结果 */
	function copyAll() {
		copyToClipboard(buildRowsText(rows.value, inputText.value), '已复制全部换算结果');
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：1000 与 1024 两套标准的由来、KiB 与 KB 的区别 -->
		<AboutPanel />
		<!-- 左栏（输入与基准值，占 2/5）与右栏（换算表与对照表，占 3/5） -->
		<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
			<div class="space-y-6">
				<!-- InputPanel：数值 / 换算标准 / 单位量级 / 小数位数单选与实时等式 -->
				<InputPanel
					:amount="amount"
					:base="base"
					:magnitude="magnitude"
					:precision="precision"
					:preview="preview"
					:unit-hint="unitHint"
					@clear="clear"
					@scale="scaleAmount"
					@apply-sample="applySample"
					@update:amount="(v: number | null) => (amount = v)"
					@update:base="(v: FileSizeBase) => (base = v)"
					@update:magnitude="(v: FileSizeMagnitude) => (magnitude = v)"
					@update:precision="(v: number) => (precision = v)"
				/>
				<!-- SummaryPanel：字节 / 比特基准值与两种进制的最简表示 -->
				<SummaryPanel :items="summary" @copy="copy" />
			</div>
			<div class="space-y-6">
				<!-- UnitTable：各量级的十进制（1000）与二进制（1024）对照表 -->
				<UnitTable :active-unit="unit" :rows="rows" @copy="copy" @copy-all="copyAll" />
				<!-- DiskReference：硬盘标称容量与系统显示值的对照 -->
				<DiskReference :rows="referenceRows" @copy="copy" />
			</div>
		</div>
	</div>
</template>
