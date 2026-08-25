<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import ResultRow from '../common/ResultRow.vue';
	import type { IdentityRecord } from '@/types/identity';

	defineProps<{
		records: IdentityRecord[];
	}>();

	const emit = defineEmits<{
		copyRecord: [value: IdentityRecord];
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
				<ResultRow :value="r.email" label="邮箱" />
				<ResultRow :value="r.phone" label="电话" />
				<ResultRow :value="r.username" label="用户名" />
				<ResultRow :value="r.birthdate" label="出生日期" />
				<ResultRow :value="r.sex" label="性别" />
				<ResultRow :value="r.zodiac" label="星座" />
			</div>
			<ResultRow :value="r.bio" label="个性签名" />
		</div>
	</div>
</template>
