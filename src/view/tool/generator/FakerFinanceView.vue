<script lang="ts" setup>
	import { ref, watch } from 'vue';
	import { useFaker } from '@/composable/useFaker';
	import { copyToClipboard } from '@/utils/clipboard';
	import ConfigPanel from '@/fragment/tool/generator/faker-finance/ConfigPanel.vue';
	import ActionBar from '@/fragment/tool/generator/faker-finance/ActionBar.vue';
	import ResultList from '@/fragment/tool/generator/faker-finance/ResultList.vue';
	import AboutPanel from '@/fragment/tool/generator/faker-finance/AboutPanel.vue';
	import type { FinanceRecord } from '@/types/finance';

	const { faker, locale, setLocale } = useFaker(() => generate());

	const count = ref(5);
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

	function copyRecord(record: FinanceRecord) {
		copyToClipboard(JSON.stringify(record, null, 2), '已复制记录');
	}

	watch(count, () => generate());

	generate();
</script>

<template>
	<div class="space-y-6">
		<ConfigPanel v-model:count="count" :locale="locale" @update:locale="setLocale" />
		<ActionBar :has-records="!!records.length" @generate="generate" @copy-all="copyAll" />
		<ResultList :records="records" @copy-record="copyRecord" />
		<AboutPanel />
	</div>
</template>
