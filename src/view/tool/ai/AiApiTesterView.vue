<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import type { ApiResponse, HistoryItem, TestStatus } from '@/types/ai';
	import { AI_PRESETS, configsEqual, generateId, loadHistory, saveHistory } from '@/utils/aiApi';
	import HistoryPanel from '@/fragment/tool/ai/ai-api-tester/HistoryPanel.vue';
	import ApiConfigPanel from '@/fragment/tool/ai/ai-api-tester/ApiConfigPanel.vue';
	import ModelListPanel from '@/fragment/tool/ai/ai-api-tester/ModelListPanel.vue';
	import TestChatPanel from '@/fragment/tool/ai/ai-api-tester/TestChatPanel.vue';
	import AboutPanel from '@/fragment/tool/ai/ai-api-tester/AboutPanel.vue';

	type AuthType = 'bearer' | 'header' | 'query';

	// ---- 历史记录 ----

	const historyList = ref<HistoryItem[]>(loadHistory());

	function addToHistory() {
		const current = {
			preset: selectedPreset.value,
			baseUrl: baseUrl.value,
			authType: authType.value,
			apiKey: apiKey.value,
			customHeaderName: customHeaderName.value,
			useProxy: useProxy.value
		};
		const exists = historyList.value.some((h) => configsEqual(h, current));
		if (exists) return;
		const item: HistoryItem = { ...current, id: generateId(), createdAt: Date.now() };
		historyList.value.unshift(item);
		saveHistory(historyList.value);
	}

	function applyHistory(item: HistoryItem) {
		selectedPreset.value = item.preset as keyof typeof AI_PRESETS;
		baseUrl.value = item.baseUrl;
		authType.value = item.authType as AuthType;
		apiKey.value = item.apiKey;
		customHeaderName.value = item.customHeaderName;
		useProxy.value = item.useProxy;
		resetAllStatus();
	}

	function deleteHistory(id: string) {
		historyList.value = historyList.value.filter((h) => h.id !== id);
		saveHistory(historyList.value);
	}

	function clearAllHistory() {
		historyList.value = [];
		saveHistory(historyList.value);
	}

	// ---- 表单状态 ----
	const selectedPreset = ref<keyof typeof AI_PRESETS>('openai');
	const baseUrl = ref(AI_PRESETS.openai.defaultBaseUrl);
	const authType = ref<AuthType>('bearer');
	const apiKey = ref('');
	const customHeaderName = ref('X-API-Key');

	const useProxy = ref(true);

	const connectionStatus = ref<TestStatus>('idle');
	const connectionMessage = ref('');
	const modelsStatus = ref<TestStatus>('idle');
	const modelsMessage = ref('');
	const models = ref<string[]>([]);

	const testModel = ref('');
	const testPrompt = ref('Say "Hello, I am working!" in one sentence.');
	const testResponse = ref('');
	const testStatus = ref<TestStatus>('idle');
	const testMessage = ref('');

	function resetAllStatus() {
		connectionStatus.value = 'idle';
		connectionMessage.value = '';
		modelsStatus.value = 'idle';
		modelsMessage.value = '';
		models.value = [];
		testStatus.value = 'idle';
		testResponse.value = '';
		testMessage.value = '';
	}

	watch(selectedPreset, (key) => {
		baseUrl.value = AI_PRESETS[key].defaultBaseUrl;
		if (key === 'anthropic') {
			authType.value = 'header';
			customHeaderName.value = 'x-api-key';
		} else {
			authType.value = 'bearer';
		}
		resetAllStatus();
	});

	const preset = computed(() => AI_PRESETS[selectedPreset.value]);
	const presetOptions = computed(() => Object.entries(AI_PRESETS).map(([k, p]) => ({ label: p.label, value: k })));

	function buildHeaders(): Record<string, string> {
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (apiKey.value) {
			if (authType.value === 'bearer') headers['Authorization'] = `Bearer ${apiKey.value}`;
			else if (authType.value === 'header') headers[customHeaderName.value] = apiKey.value;
		}
		const presetHeaders = preset.value.headers(apiKey.value);
		for (const [key, value] of Object.entries(presetHeaders)) {
			const lower = key.toLowerCase();
			if (lower !== 'authorization' && lower !== 'content-type' && lower !== 'x-api-key') headers[key] = value;
		}
		return headers;
	}

	function getFullUrl(path: string): string {
		let url = baseUrl.value.replace(/\/+$/, '');
		if (authType.value === 'query' && apiKey.value)
			url += path + (path.includes('?') ? '&' : '?') + `key=${encodeURIComponent(apiKey.value)}`;
		else url += path;
		return url;
	}

	async function apiFetch(url: string, options: RequestInit): Promise<ApiResponse> {
		if (!useProxy.value) {
			const resp = await fetch(url, options);
			return { ok: resp.ok, status: resp.status, json: () => resp.json(), text: () => resp.text() };
		}
		const proxyResp = await fetch('/api/proxy', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url, method: options.method || 'GET', headers: options.headers || {}, body: options.body })
		});
		const data = await proxyResp.json();
		if (!data.ok) throw new Error(data.error || '代理请求失败');
		return {
			ok: data.status >= 200 && data.status < 300,
			status: data.status,
			json: async () => {
				try {
					return JSON.parse(data.body);
				} catch {
					return data.body;
				}
			},
			text: async () => data.body
		};
	}

	async function testConnection() {
		if (!apiKey.value.trim()) {
			connectionStatus.value = 'error';
			connectionMessage.value = '请先填写 API Key';
			return;
		}
		connectionStatus.value = 'loading';
		connectionMessage.value = '正在连接...';
		try {
			const headers = buildHeaders();
			const resp = await apiFetch(getFullUrl(preset.value.modelsPath), { method: 'GET', headers });
			if (resp.ok) {
				connectionStatus.value = 'success';
				connectionMessage.value = `连接成功 (HTTP ${resp.status})`;
			} else {
				const body = await resp.text().catch(() => '');
				connectionStatus.value = 'error';
				connectionMessage.value = `HTTP ${resp.status}: ${body.slice(0, 200) || 'Unknown error'}`;
			}
		} catch (e: any) {
			connectionStatus.value = 'error';
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError')
				connectionMessage.value =
					'网络错误：可能是 CORS 限制或 URL 不可达。浏览器端请求可能被服务端拒绝，建议开启代理。';
			else connectionMessage.value = `请求失败: ${e.message}`;
		}
	}

	async function fetchModels() {
		if (!apiKey.value.trim()) {
			modelsStatus.value = 'error';
			modelsMessage.value = '请先填写 API Key';
			return;
		}
		modelsStatus.value = 'loading';
		modelsMessage.value = '正在获取模型列表...';
		try {
			const headers = buildHeaders();
			const resp = await apiFetch(getFullUrl(preset.value.modelsPath), { method: 'GET', headers });
			if (!resp.ok) {
				const body = await resp.text().catch(() => '');
				modelsStatus.value = 'error';
				modelsMessage.value = `HTTP ${resp.status}: ${body.slice(0, 200)}`;
				return;
			}
			const data = await resp.json();
			models.value = preset.value.parseModels(data);
			if (models.value.length === 0) {
				modelsStatus.value = 'success';
				modelsMessage.value = '未解析到模型数据，请查看原始响应';
			} else {
				modelsStatus.value = 'success';
				modelsMessage.value = `共获取到 ${models.value.length} 个模型`;
			}
		} catch (e: any) {
			modelsStatus.value = 'error';
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError')
				modelsMessage.value = '网络错误：可能是 CORS 限制。请确认 API 端点支持跨域请求，或开启代理。';
			else modelsMessage.value = `请求失败: ${e.message}`;
		}
	}

	async function sendTestMessage() {
		if (!apiKey.value.trim()) {
			testStatus.value = 'error';
			testMessage.value = '请先填写 API Key';
			return;
		}
		const model = testModel.value.trim() || (models.value[0] ?? '');
		if (!model) {
			testStatus.value = 'error';
			testMessage.value = '请选择一个模型或手动输入模型名称';
			return;
		}
		testStatus.value = 'loading';
		testMessage.value = '正在发送...';
		testResponse.value = '';
		try {
			const headers = buildHeaders();
			let chatPath = '/v1/chat/completions';
			let body: unknown;
			if (selectedPreset.value === 'anthropic') {
				chatPath = '/v1/messages';
				body = { model, max_tokens: 100, messages: [{ role: 'user', content: testPrompt.value }] };
			} else if (selectedPreset.value === 'gemini') {
				chatPath = `/v1beta/models/${model}:generateContent`;
				body = { contents: [{ parts: [{ text: testPrompt.value }] }] };
			} else {
				body = { model, messages: [{ role: 'user', content: testPrompt.value }], max_tokens: 100 };
			}
			const resp = await apiFetch(getFullUrl(chatPath), { method: 'POST', headers, body: JSON.stringify(body) });
			const data = await resp.json().catch(() => null);
			if (!resp.ok) {
				testStatus.value = 'error';
				testMessage.value = `HTTP ${resp.status}: ${JSON.stringify(data?.error ?? data ?? 'Unknown error').slice(0, 300)}`;
				return;
			}
			let content = '';
			if (selectedPreset.value === 'gemini')
				content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data);
			else if (selectedPreset.value === 'anthropic') content = data?.content?.[0]?.text ?? JSON.stringify(data);
			else content = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
			testResponse.value = content;
			testStatus.value = 'success';
			testMessage.value = '响应成功';
		} catch (e: any) {
			testStatus.value = 'error';
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError')
				testMessage.value = '网络错误：可能是 CORS 限制。浏览器端请求可能被服务端拒绝，请开启代理。';
			else testMessage.value = `请求失败: ${e.message}`;
		}
	}
</script>

<template>
	<div class="space-y-6">
		<!-- HistoryPanel：历史配置记录面板（保存 / 应用 / 删除 / 清空） -->
		<HistoryPanel
			:has-api-key="!!apiKey.trim()"
			:history-list="historyList"
			@apply="applyHistory"
			@delete="deleteHistory"
			@save="addToHistory"
			@clear-all="clearAllHistory"
		/>

		<!-- ApiConfigPanel：API 连接配置面板（预设 / Base URL / 认证方式 / API Key / 代理开关） -->
		<ApiConfigPanel
			:api-key="apiKey"
			:auth-type="authType"
			:base-url="baseUrl"
			:connection-message="connectionMessage"
			:connection-status="connectionStatus"
			:custom-header-name="customHeaderName"
			:preset-options="presetOptions"
			:selected-preset="selectedPreset"
			:use-proxy="useProxy"
			@update:selectedPreset="(v: string) => (selectedPreset = v as keyof typeof AI_PRESETS)"
			@update:baseUrl="(v: string) => (baseUrl = v)"
			@update:authType="(v: AuthType) => (authType = v)"
			@update:apiKey="(v: string) => (apiKey = v)"
			@update:customHeaderName="(v: string) => (customHeaderName = v)"
			@update:useProxy="(v: boolean) => (useProxy = v)"
			@test-connection="testConnection"
			@fetch-models="fetchModels"
		/>

		<!-- ModelListPanel：模型列表面板（获取并展示可用模型，点击选择测试模型） -->
		<ModelListPanel
			:models="models"
			:models-message="modelsMessage"
			:models-status="modelsStatus"
			:test-model="testModel"
			@select-model="(m: string) => (testModel = m)"
		/>

		<!-- TestChatPanel：测试对话面板（输入提示词发送请求并展示响应） -->
		<TestChatPanel
			v-model:test-model="testModel"
			v-model:test-prompt="testPrompt"
			:test-message="testMessage"
			:test-response="testResponse"
			:test-status="testStatus"
			@send="sendTestMessage"
		/>

		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
