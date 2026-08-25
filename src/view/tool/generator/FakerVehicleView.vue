<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-vehicle/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-vehicle/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-vehicle/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-vehicle/AboutPanel.vue';
	import type { VehicleRecord } from '@/types/faker';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
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

	function copyRecord(record: VehicleRecord) {
		copyToClipboard(JSON.stringify(record, null, 2), '已复制记录');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- ConfigPanel：生成配置面板（数量 + 语言区域选择，默认中文） -->
		<ConfigPanel :count="count" :locale="locale" @update:count="(v) => (count = v)" @update:locale="setLocale" />
		<!-- ActionBar：生成 / 复制全部 操作按钮 -->
		<ActionBar :records="records" @generate="generate" @copy-all="copyAll" />
		<!-- ResultList：生成的随机车辆信息记录列表（品牌 / 型号 / VIN 等，点击单条复制） -->
		<ResultList :records="records" @copy-record="copyRecord" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
