<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { NButton, NInputNumber } from 'naive-ui';
	import { useFaker } from '@/data/useFaker';
	import LocaleSelect from './common/LocaleSelect.vue';
	import ResultRow from './common/ResultRow.vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/components/common/TkuIcon.vue';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);

	interface CompanyRecord {
		name: string;
		catchPhrase: string;
		buzzPhrase: string;
		department: string;
		jobTitle: string;
		product: string;
		price: string;
	}

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
					<span class="text-sm font-semibold text-slate-700">{{ i + 1 }}. {{ r.name }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.name" label="公司名称" />
					<ResultRow :value="r.catchPhrase" label="宣传语" />
					<ResultRow :value="r.buzzPhrase" label="流行语" />
					<ResultRow :value="r.department" label="所在部门" />
					<ResultRow :value="r.jobTitle" label="职位" />
					<ResultRow :value="r.product" label="主营产品" />
					<ResultRow :value="r.price" label="参考价格" />
				</div>
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「企业信息生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具生成仿真企业资料，包括公司名称、宣传语、流行语、部门、职位、主营产品与参考价格。中文区域会产出「福南市丽食品股份有限公司」这样的
				中文命名，英文区域则生成「Dicki, Fahey and Keebler」风格的公司名。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				宣传语（Catch Phrase）与流行语（Buzz Phrase）模仿真实企业营销文案的语气，适合填充公司简介、About 页面或
				招投标演示材料；产品价格会随语言区域自动使用 ¥ 或 $ 符号。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">典型场景</span>：企业名录 Demo、CRM
				系统测试数据、商务文档示例、以及需要「像模像样」公司信息的 UI 展示，所有名称均为随机虚构，如有雷同纯属巧合。
			</p>
		</div>
	</div>
</template>
