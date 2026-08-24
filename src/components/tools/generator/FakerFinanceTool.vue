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

	interface FinanceRecord {
		accountName: string;
		accountNumber: string;
		amount: string;
		creditCard: string;
		issuer: string;
		cvv: string;
		iban: string;
		bic: string;
		transaction: string;
	}

	const records = ref<FinanceRecord[]>([]);

	function generate() {
		const fk = faker();
		const symbol = locale.value === 'en_US' ? '$' : '¥';
		const result: FinanceRecord[] = [];
		for (let i = 0; i < count.value; i++) {
			result.push({
				accountName: fk.finance.accountName(),
				accountNumber: fk.finance.accountNumber({ length: 12 }),
				amount: fk.finance.amount({ min: 10, max: 99999, dec: 2, symbol }),
				creditCard: fk.finance.creditCardNumber(),
				issuer: fk.finance.creditCardIssuer(),
				cvv: fk.finance.creditCardCVV(),
				iban: fk.finance.iban(),
				bic: fk.finance.bic(),
				transaction: fk.finance.transactionDescription()
			});
		}
		records.value = result;
	}

	function copyAll() {
		const text = records.value
			.map(
				(r, i) =>
					`# 金融记录 ${i + 1}\n户名：${r.accountName}\n账号：${r.accountNumber}\n金额：${r.amount}\n卡号：${r.creditCard} (${r.issuer})\nCVV：${r.cvv}\nIBAN：${r.iban}\nBIC：${r.bic}\n交易描述：${r.transaction}`
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
					<span class="text-sm font-semibold text-slate-700">金融记录 {{ i + 1 }}</span>
					<n-button secondary size="tiny" @click="copyToClipboard(JSON.stringify(r, null, 2), '已复制记录')">
						复制记录
					</n-button>
				</div>
				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
					<ResultRow :value="r.accountName" label="户名" />
					<ResultRow :value="r.accountNumber" label="账号" />
					<ResultRow :value="r.amount" label="金额" />
					<ResultRow :value="r.creditCard" label="卡号" />
					<ResultRow :value="r.issuer" label="发卡机构" />
					<ResultRow :value="r.cvv" label="CVV" />
					<ResultRow :value="r.iban" label="IBAN" />
					<ResultRow :value="r.bic" label="BIC/SWIFT" />
				</div>
				<ResultRow :value="r.transaction" label="交易描述" />
			</div>
		</div>

		<!-- 介绍 -->
		<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
			<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「金融信息生成」</h3>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				本工具生成仿真金融数据：账户户名、账号、金额、信用卡号、发卡机构、CVV、IBAN 与 BIC
				码，以及交易描述。金额符号会随语言区域在 ¥ 与 $ 间切换。
			</p>
			<p class="mb-2 text-sm leading-relaxed text-slate-600">
				卡号遵循 Luhn 校验算法生成，可被常见的格式校验器识别；IBAN 按所选区域的格式规则生成（如德国 DE、法国 FR
				前缀），BIC 码为 8 或 11 位 SWIFT 格式，适合联调银行类接口的字段格式。
			</p>
			<p class="text-sm leading-relaxed text-slate-600">
				<span class="font-medium text-blue-800">重要提醒</span
				>：以上均为随机生成的虚构数据，不关联任何真实账户或卡片，仅用于开发测试与
				演示。切勿将其用于支付、实名认证或任何真实金融业务。
			</p>
		</div>
	</div>
</template>
