<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-company/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-company/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-company/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-company/AboutPanel.vue';
	import type { CompanyRecord } from '@/types/faker';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);

	const records = ref<CompanyRecord[]>([]);

	function generate() {
		const fk = faker();
		const result: CompanyRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				name: fk.company.name(),
				catchPhrase: fk.company.catchPhrase(),
				buzzPhrase: fk.company.buzzPhrase(),
				department: fk.commerce.department(),
				jobTitle: fk.person.jobTitle(),
				product: fk.commerce.productName(),
				price: fk.commerce.price({ min: 10, max: 9999, dec: 2, symbol: locale.value === 'en_US' ? '$' : '¥' })
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 企业 ${i + 1}\n公司名称：${r.name}\n宣传语：${r.catchPhrase}\n流行语：${r.buzzPhrase}\n部门：${r.department}\n职位：${r.jobTitle}\n主营产品：${r.product}\n参考价格：${r.price}`
			)
			.join('\n\n');
		copyToClipboard(text, '已复制全部');
	}

	function copyRecord(record: CompanyRecord) {
		copyToClipboard(JSON.stringify(record, null, 2), '已复制记录');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<!-- ConfigPanel：生成配置面板（数量 + 语言区域选择，默认中文） -->
		<ConfigPanel :count="count" :locale="locale" @update:locale="setLocale" @update:count="(v) => (count = v)" />
		<!-- ActionBar：生成 / 复制全部 操作按钮 -->
		<ActionBar :has-records="!!records.length" @generate="generate" @copy-all="copyAll" />
		<!-- ResultList：生成的随机企业信息记录列表（点击单条复制） -->
		<ResultList :records="records" @copy-record="copyRecord" />
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
