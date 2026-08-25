<script lang="ts" setup>
	import { NAlert, NButton, NInput, NSelect, NSwitch } from 'naive-ui';
	import type { TestStatus } from '@/types/ai';

	type AuthType = 'bearer' | 'header' | 'query';

	const props = defineProps<{
		presetOptions: { label: string; value: string }[];
		selectedPreset: string;
		baseUrl: string;
		authType: AuthType;
		apiKey: string;
		customHeaderName: string;
		useProxy: boolean;
		connectionStatus: TestStatus;
		connectionMessage: string;
	}>();

	const emit = defineEmits<{
		'update:selectedPreset': [value: string];
		'update:baseUrl': [value: string];
		'update:authType': [value: AuthType];
		'update:apiKey': [value: string];
		'update:customHeaderName': [value: string];
		'update:useProxy': [value: boolean];
		testConnection: [];
		fetchModels: [];
	}>();

	const authTypeOptions = [
		{ label: 'Bearer Token (Authorization: Bearer)', value: 'bearer' },
		{ label: '自定义 Header', value: 'header' },
		{ label: 'Query 参数 (?key=)', value: 'query' }
	];

	function alertType(status: TestStatus): 'info' | 'success' | 'error' {
		if (status === 'loading') return 'info';
		if (status === 'success') return 'success';
		return 'error';
	}
</script>

<template>
	<section>
		<h2 class="mb-4 text-lg font-semibold text-gray-800">API 配置</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">API 格式</label>
				<n-select
					:options="props.presetOptions"
					:value="props.selectedPreset"
					@update:value="(v: string) => emit('update:selectedPreset', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">Base URL</label>
				<n-input
					:value="props.baseUrl"
					placeholder="https://api.openai.com"
					@update:value="(v: string) => emit('update:baseUrl', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700">认证方式</label>
				<n-select
					:options="authTypeOptions"
					:value="props.authType"
					@update:value="(v: AuthType) => emit('update:authType', v)"
				/>
			</div>
			<div v-if="props.authType === 'header'">
				<label class="mb-1 block text-sm font-medium text-gray-700">Header 名称</label>
				<n-input
					:value="props.customHeaderName"
					placeholder="X-API-Key"
					@update:value="(v: string) => emit('update:customHeaderName', v)"
				/>
			</div>
		</div>

		<div class="mt-4">
			<label class="mb-1 block text-sm font-medium text-gray-700">API Key</label>
			<n-input
				:placeholder="props.authType === 'query' ? 'your-api-key' : 'sk-...'"
				:value="props.apiKey"
				show-password-toggle
				type="password"
				@update:value="(v: string) => emit('update:apiKey', v)"
			/>
		</div>

		<div class="mt-4 flex items-center gap-3">
			<n-switch :value="props.useProxy" @update:value="(v: boolean) => emit('update:useProxy', v)" />
			<span class="text-sm font-medium text-gray-700">通过本地代理请求</span>
			<span class="text-xs text-gray-400">绕过 CORS 和 HTTP/HTTPS 混合内容限制</span>
		</div>

		<div class="mt-4 flex flex-wrap gap-3">
			<n-button size="small" type="primary" @click="emit('testConnection')"> 测试连接 </n-button>
			<n-button size="small" type="success" @click="emit('fetchModels')"> 获取模型列表 </n-button>
		</div>

		<n-alert
			v-if="props.connectionStatus !== 'idle'"
			:title="props.connectionMessage"
			:type="alertType(props.connectionStatus)"
			class="mt-3"
		/>
	</section>
</template>
