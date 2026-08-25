<script lang="ts" setup>
	import { computed } from 'vue';
	import { NCard, NInput } from 'naive-ui';

	const props = defineProps<{
		siteName: string;
		siteDescription: string;
	}>();

	const emit = defineEmits<{
		'update:siteName': [value: string];
		'update:siteDescription': [value: string];
	}>();

	const siteName = computed({
		get: () => props.siteName,
		set: (v: string) => emit('update:siteName', v)
	});

	const siteDescription = computed({
		get: () => props.siteDescription,
		set: (v: string) => emit('update:siteDescription', v)
	});
</script>

<template>
	<!-- 站点信息卡片：站点名称与描述 -->
	<n-card size="small" title="站点信息">
		<div class="space-y-4">
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">站点名称</label>
				<n-input v-model:value="siteName" placeholder="例: TKU" />
			</div>
			<div>
				<label class="block text-xs font-semibold text-slate-500 mb-1">站点描述</label>
				<n-input v-model:value="siteDescription" placeholder="站点的一句话简介" />
			</div>
		</div>
	</n-card>
</template>
