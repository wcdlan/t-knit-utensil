<script lang="ts" setup>
	import type { LicenseProfile, ScoredLicense } from '@/types/license';
	import LicenseCard from './LicenseCard.vue';

	const props = defineProps<{
		items: ScoredLicense[];
		total: number;
		expandedId: string | null;
		copiedId: string | null;
		selectedLang: string;
		expandedText: string;
	}>();

	const emit = defineEmits<{
		'toggle-expand': [id: string];
		copy: [license: LicenseProfile];
		download: [license: LicenseProfile];
		'update:selectedLang': [lang: string];
	}>();
</script>

<template>
	<div class="flex-1 min-w-0">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-bold text-gray-800">
				推荐结果
				<span class="text-sm font-normal text-gray-400 ml-2">按适配度排序</span>
			</h2>
			<span class="text-xs text-gray-400">{{ props.total }} 个许可证</span>
		</div>

		<div class="space-y-3">
			<LicenseCard
				v-for="item in props.items"
				:key="item.license.id"
				:copied-id="props.copiedId"
				:expanded-id="props.expandedId"
				:expanded-text="props.expandedText"
				:item="item"
				:selected-lang="props.selectedLang"
				@copy="(license: LicenseProfile) => emit('copy', license)"
				@download="(license: LicenseProfile) => emit('download', license)"
				@toggle-expand="(id: string) => emit('toggle-expand', id)"
				@update:selected-lang="(lang: string) => emit('update:selectedLang', lang)"
			/>
		</div>
	</div>
</template>
