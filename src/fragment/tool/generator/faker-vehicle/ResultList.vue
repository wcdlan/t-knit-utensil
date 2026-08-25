<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { VehicleRecord } from '@/types/faker';

	defineProps<{
		records: VehicleRecord[];
	}>();

	const emit = defineEmits<{
		'copy-record': [record: VehicleRecord];
	}>();
</script>

<template>
	<div v-if="records.length" class="space-y-3">
		<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-sm font-semibold text-slate-700">车辆 {{ i + 1 }}：{{ r.vehicle }}</span>
				<n-button secondary size="tiny" @click="emit('copy-record', r)">复制记录</n-button>
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
</template>
