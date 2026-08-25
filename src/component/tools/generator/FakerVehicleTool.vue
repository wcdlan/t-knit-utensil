<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import ResultRow from './common/ResultRow.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);

	interface VehicleRecord {
		vehicle: string;
		manufacturer: string;
		model: string;
		type: string;
		fuel: string;
		vin: string;
		plate: string;
		color: string;
	}

	const records = ref<VehicleRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: VehicleRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				vehicle: fk.vehicle.vehicle(),
				manufacturer: fk.vehicle.manufacturer(),
				model: fk.vehicle.model(),
				type: fk.vehicle.type(),
				fuel: fk.vehicle.fuel(),
				vin: fk.vehicle.vin(),
				plate: fk.vehicle.vrm(),
				color: fk.color.human()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 车辆 ${i + 1}\n名称：${r.vehicle}\n品牌：${r.manufacturer}\n型号：${r.model}\n类型：${r.type}\n燃料：${r.fuel}\nVIN：${r.vin}\n车牌：${r.plate}\n颜色：${r.color}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- 生成配置 -->
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div class="flex flex-wrap items-center gap-4">
				<LocaleSelect :model-value="locale" @update:model-value="setLocale" />
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold text-slate-500">生成数量</span>
					<n-input-number v-model:value="count" :max="20" :min="1" class="w-20" />
				</div>
			</div>
		</div>

		<!-- 操作按钮 -->
		<div class="flex gap-2">
			<n-button type="primary" @click="generate">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.refresh" :size="16" />
					<span>重新生成</span>
				</span>
			</n-button>
			<n-button :disabled="!records.length" secondary @click="copyAll">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.clipboard" :size="16" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- 结果 -->
		<div v-if="records.length" class="space-y-3">
			<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-sm font-semibold text-slate-700">车辆 {{ i + 1 }}：{{ r.vehicle }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.manufacturer" label="品牌" />
					<ResultRow :value="r.model" label="型号" />
					<ResultRow :value="r.type" label="类型" />
					<ResultRow :value="r.fuel" label="燃料" />
					<ResultRow :value="r.vin" label="VIN 码" />
					<ResultRow :value="r.plate" label="车牌号" />
					<ResultRow :value="r.color" label="车身颜色" />
				</div>
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「车辆信息生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具生成仿真车辆档案：整车名称、品牌、型号、类型、燃料、VIN 码、车牌号与车身颜色。中文区域会产出「雪铁龙
				Ranchero」「电动」等 混合本地化数据，切换英文区域则为欧美常见格式。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				VIN（车辆识别码）为 17
				位标准格式，包含厂商识别码、车辆说明部分与校验位；车牌号（VRM）由字母与数字按区域规则组合。 车身颜色取自 Faker
				颜色词库，如「淡紫色」「Inchworm」等。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">典型场景</span>：汽车销售
				Demo、租车平台测试、保险系统样例数据，以及需要整车信息展示的 管理后台界面。
			</p>
		</div>
	</div>
</template>
