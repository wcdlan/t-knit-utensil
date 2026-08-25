<script lang="ts" setup>
	import { NAlert, NTag } from 'naive-ui';
	import type { TestStatus } from '@/types/ai';

	defineProps<{
		models: string[];
		testModel: string;
		modelsStatus: TestStatus;
		modelsMessage: string;
	}>();

	const emit = defineEmits<{
		'select-model': [model: string];
	}>();

	function alertType(status: TestStatus): 'info' | 'success' | 'error' {
		if (status === 'loading') return 'info';
		if (status === 'success') return 'success';
		return 'error';
	}
</script>

<template>
	<section v-if="models.length > 0">
		<h2 class="mb-3 text-lg font-semibold text-gray-800">
			可用模型 <span class="text-sm font-normal text-gray-500">({{ models.length }})</span>
		</h2>
		<div class="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
			<div class="flex flex-wrap gap-2">
				<n-tag
					v-for="m in models"
					:key="m"
					:type="testModel === m ? 'primary' : 'default'"
					class="cursor-pointer"
					@click="emit('select-model', m)"
				>
					{{ m }}
				</n-tag>
			</div>
		</div>
		<n-alert v-if="modelsStatus !== 'idle'" :title="modelsMessage" :type="alertType(modelsStatus)" class="mt-2" />
	</section>
</template>
