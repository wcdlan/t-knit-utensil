<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-address/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-address/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-address/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-address/AboutPanel.vue';
	import type { AddressRecord } from '@/types/faker';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
	const records = ref<AddressRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: AddressRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				country: fk.location.country(),
				state: fk.location.state(),
				city: fk.location.city(),
				street: fk.location.streetAddress(),
				postal: fk.location.zipCode(),
				latitude: fk.location.latitude({ precision: 4 }).toFixed(4),
				longitude: fk.location.longitude({ precision: 4 }).toFixed(4),
				timeZone: fk.location.timeZone()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 地址 ${i + 1}\n国家：${r.country}\n省份/州：${r.state}\n城市：${r.city}\n街道：${r.street}\n邮编：${r.postal}\n经纬度：${r.latitude}, ${r.longitude}\n时区：${r.timeZone}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	function copyRecord(record: AddressRecord) {
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
		<!-- ResultList：生成的随机地址记录列表（点击单条复制） -->
		<ResultList :records="records" @copy-record="copyRecord" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
