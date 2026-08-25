<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { CompanyRecord } from '@/types/faker';

	defineProps<{
		records: CompanyRecord[];
	}>();

	const emit = defineEmits<{
		copyRecord: [record: CompanyRecord];
	}>();
</script>

<template>
	<div v-if="records.length" class="space-y-3">
		<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-sm font-semibold text-slate-700">{{ i + 1 }}. {{ r.name }}</span>
				<n-button secondary size="tiny" @click="emit('copyRecord', r)">复制记录</n-button>
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
</template>
