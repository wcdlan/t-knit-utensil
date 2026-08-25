<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { AddressRecord } from '@/types/faker';

	defineProps<{
		records: AddressRecord[];
	}>();

	const emit = defineEmits<{
		'copy-record': [record: AddressRecord];
	}>();
</script>

<template>
	<div v-if="records.length" class="space-y-3">
		<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-sm font-semibold text-slate-700">地址 {{ i + 1 }}：{{ r.city }}</span>
				<n-button secondary size="tiny" @click="emit('copy-record', r)">复制记录</n-button>
			</div>
			<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
				<ResultRow :value="r.country" label="国家" />
				<ResultRow :value="r.state" label="省份/州" />
				<ResultRow :value="r.city" label="城市" />
				<ResultRow :value="r.street" label="街道地址" />
				<ResultRow :value="r.postal" label="邮编" />
				<ResultRow :value="r.timeZone" label="时区" />
			</div>
			<ResultRow :value="`${r.latitude}, ${r.longitude}`" label="经纬度" />
		</div>
	</div>
</template>
