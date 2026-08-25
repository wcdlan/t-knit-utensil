<script lang="ts" setup>
	import { NRadio, NRadioGroup } from 'naive-ui';
	import type { Question } from '@/types/license';

	const props = defineProps<{
		questions: Question[];
		answers: Record<string, string>;
	}>();

	const emit = defineEmits<{
		'update:answer': [questionId: string, value: string];
	}>();
</script>

<template>
	<div class="lg:w-96 shrink-0 space-y-5">
		<div v-for="q in props.questions" :key="q.id" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
			<h3 class="text-sm font-semibold text-gray-800 mb-3">{{ q.text }}</h3>
			<n-radio-group
				:name="q.id"
				:value="props.answers[q.id]"
				class="w-full"
				@update:value="(v: string) => emit('update:answer', q.id, v)"
			>
				<div class="space-y-1.5">
					<div
						v-for="opt in q.options"
						:key="opt.value"
						:class="props.answers[q.id] === opt.value ? 'bg-white border-blue-300 shadow-sm' : ''"
						class="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition hover:bg-white border border-transparent"
						@click="emit('update:answer', q.id, opt.value)"
					>
						<n-radio :value="opt.value" class="mt-0.5 shrink-0" />
						<div>
							<div class="text-sm font-medium text-gray-700">{{ opt.label }}</div>
							<div class="text-xs text-gray-400 mt-0.5">{{ opt.description }}</div>
						</div>
					</div>
				</div>
			</n-radio-group>
		</div>
	</div>
</template>
