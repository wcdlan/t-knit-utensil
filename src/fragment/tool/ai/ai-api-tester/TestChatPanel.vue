<script lang="ts" setup>
	import { NAlert, NButton, NInput } from 'naive-ui';
	import type { TestStatus } from '@/types/ai';

	defineProps<{
		testModel: string;
		testPrompt: string;
		testStatus: TestStatus;
		testMessage: string;
		testResponse: string;
	}>();

	const emit = defineEmits<{
		'update:testModel': [value: string];
		'update:testPrompt': [value: string];
		send: [];
	}>();

	function alertType(status: TestStatus): 'info' | 'success' | 'error' {
		if (status === 'loading') return 'info';
		if (status === 'success') return 'success';
		return 'error';
	}
</script>

<template>
	<section>
		<h2 class="mb-4 text-lg font-semibold text-gray-800">测试对话</h2>
		<div class="grid grid-cols-1 gap-4">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">模型</label>
				<n-input
					:value="testModel"
					placeholder="gpt-4o-mini"
					@update:value="(v: string) => emit('update:testModel', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">测试 Prompt</label>
				<n-input
					:autosize="{ minRows: 3 }"
					:value="testPrompt"
					type="textarea"
					@update:value="(v: string) => emit('update:testPrompt', v)"
				/>
			</div>
		</div>
		<n-button :loading="testStatus === 'loading'" class="mt-4" size="small" type="primary" @click="emit('send')">
			发送消息
		</n-button>
		<div class="mt-4">
			<n-alert v-if="testStatus !== 'idle'" :title="testMessage" :type="alertType(testStatus)" />
			<div class="mt-3">
				<label class="mb-2 block text-xs font-semibold text-slate-500">AI 响应</label>
				<div
					:class="testResponse ? 'text-gray-800' : 'text-gray-400'"
					class="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm"
				>
					{{ testResponse || '发送消息后将显示 AI 的回复内容' }}
				</div>
			</div>
		</div>
	</section>
</template>
