<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { NetworkRecord } from '@/types/network';

	defineProps<{
		records: NetworkRecord[];
		withDevice: boolean;
	}>();

	const emit = defineEmits<{
		'copy-record': [record: NetworkRecord];
	}>();
</script>

<template>
	<div v-if="records.length" class="space-y-3">
		<div v-for="(r, i) in records" :key="i" class="space-y-1.5 rounded-xl border border-slate-100 p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-sm font-semibold text-slate-700">网络记录 {{ i + 1 }}：{{ r.domain }}</span>
				<n-button secondary size="tiny" @click="emit('copy-record', r)">复制记录</n-button>
			</div>
			<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
				<ResultRow :value="r.domain" label="域名" />
				<ResultRow :value="r.email" label="邮箱" />
				<ResultRow :value="r.ipv4" label="IPv4" />
				<ResultRow :value="r.ipv6" label="IPv6" />
				<ResultRow :value="r.mac" label="MAC 地址" />
				<ResultRow :value="String(r.port)" label="端口" />
				<ResultRow :value="String(r.statusCode)" label="HTTP 状态码" />
			</div>
			<ResultRow v-if="withDevice" :value="r.userAgent" label="浏览器 UA" />
		</div>
	</div>
</template>
