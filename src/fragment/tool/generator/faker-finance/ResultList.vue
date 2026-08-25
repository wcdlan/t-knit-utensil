<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { FinanceRecord } from '@/types/finance';

	defineProps<{
		records: FinanceRecord[];
	}>();

	const emit = defineEmits<{
		'copy-record': [record: FinanceRecord];
	}>();
</script>

<template>
	<div v-if="records.length" class="space-y-3">
		<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-sm font-semibold text-slate-700">金融记录 {{ i + 1 }}</span>
				<n-button secondary size="tiny" @click="emit('copy-record', r)">复制记录</n-button>
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
</template>
