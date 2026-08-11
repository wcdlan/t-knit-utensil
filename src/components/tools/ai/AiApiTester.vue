<script lang="ts" setup>
	import { NAlert, NButton, NInput, NPopover, NSelect, NSwitch, NTag } from 'naive-ui';
	import { computed, ref, watch } from 'vue';
	import type { ApiPreset, ApiResponse, HistoryItem, TestStatus } from '@/types/ai';

	// ---- 预设的 API 格式 ----

	const presets: Record<string, ApiPreset> = {
		openai: {
			key: 'openai',
			label: 'OpenAI 兼容',
			defaultBaseUrl: 'https://api.openai.com',
			modelsPath: '/v1/models',
			modelListKey: 'data',
			headers: (apiKey) => ({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }),
			buildTestBody: (model) => ({
				model,
				messages: [{ role: 'user', content: 'Hi, respond with just "OK".' }],
				max_tokens: 10
			}),
			parseModels: (data: any) => {
				const list = data?.data ?? data;
				if (Array.isArray(list)) return list.map((m: any) => m.id ?? m.name ?? String(m)).filter(Boolean);
				return [];
			}
		},
		anthropic: {
			key: 'anthropic',
			label: 'Anthropic',
			defaultBaseUrl: 'https://api.anthropic.com',
			modelsPath: '/v1/models',
			modelListKey: 'data',
			headers: (apiKey) => ({
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01',
				'Content-Type': 'application/json'
			}),
			buildTestBody: (model) => ({
				model,
				max_tokens: 10,
				messages: [{ role: 'user', content: 'Hi, respond with just "OK".' }]
			}),
			parseModels: (data: any) => {
				const list = data?.data ?? data;
				if (Array.isArray(list)) return list.map((m: any) => m.id ?? m.name ?? String(m)).filter(Boolean);
				return [];
			}
		},
		gemini: {
			key: 'gemini',
			label: 'Google Gemini',
			defaultBaseUrl: 'https://generativelanguage.googleapis.com',
			modelsPath: '/v1beta/models',
			modelListKey: 'models',
			headers: (_apiKey) => ({ 'Content-Type': 'application/json' }),
			buildTestBody: () => ({}),
			parseModels: (data: any) => {
				const list = data?.models ?? data;
				if (Array.isArray(list)) {
					return list
						.map((m: any) => m.name?.replace(/^models\//, '') ?? m.id ?? String(m))
						.filter((n: string) => !n.includes('legacy') && !n.includes('deprecated'));
				}
				return [];
			}
		}
	};

	// ---- 历史记录 ----

	const STORAGE_KEY = 'ai-api-tester-history';

	function loadHistory(): HistoryItem[] {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	}
	function saveHistory(list: HistoryItem[]) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	}
	function generateId(): string {
		return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
	}
	function configsEqual(a: HistoryItem, b: Omit<HistoryItem, 'id' | 'createdAt'>): boolean {
		return (
			a.preset === b.preset &&
			a.baseUrl === b.baseUrl &&
			a.authType === b.authType &&
			a.apiKey === b.apiKey &&
			a.customHeaderName === b.customHeaderName &&
			a.useProxy === b.useProxy
		);
	}

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
		selectedPreset.value = item.preset as keyof typeof presets;
		baseUrl.value = item.baseUrl;
		authType.value = item.authType as 'bearer' | 'header' | 'query';
		apiKey.value = item.apiKey;
		customHeaderName.value = item.customHeaderName;
		useProxy.value = item.useProxy;
		connectionStatus.value = 'idle';
		connectionMessage.value = '';
		modelsStatus.value = 'idle';
		modelsMessage.value = '';
		models.value = [];
		testStatus.value = 'idle';
		testResponse.value = '';
		testMessage.value = '';
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
	const selectedPreset = ref<keyof typeof presets>('openai');
	const baseUrl = ref(presets.openai.defaultBaseUrl);
	const authType = ref<'bearer' | ('header' | 'query')>('bearer');
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

	watch(selectedPreset, (key) => {
		baseUrl.value = presets[key].defaultBaseUrl;
		if (key === 'anthropic') {
			authType.value = 'header';
			customHeaderName.value = 'x-api-key';
		} else {
			authType.value = 'bearer';
		}
		connectionStatus.value = 'idle';
		connectionMessage.value = '';
		modelsStatus.value = 'idle';
		modelsMessage.value = '';
		models.value = [];
		testStatus.value = 'idle';
		testResponse.value = '';
		testMessage.value = '';
	});

	const preset = computed(() => presets[selectedPreset.value]);
	const presetOptions = computed(() => Object.entries(presets).map(([k, p]) => ({ label: p.label, value: k })));

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
		<!-- Section 0: 历史记录 -->
		<section>
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-lg font-semibold text-gray-800 inline-flex items-center gap-1">
					历史记录
					<n-popover placement="top" trigger="hover">
						<template #trigger>
							<span
								class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-300 text-[9px] leading-none text-white font-bold cursor-pointer select-none"
								>!</span
							>
						</template>
						<span>数据存储在客户端本地，放心使用</span>
					</n-popover>
				</h2>
				<div class="flex gap-2">
					<n-button :disabled="!apiKey.trim()" size="small" type="success" @click="addToHistory"> 保存当前 </n-button>
					<n-button v-if="historyList.length" secondary size="small" type="error" @click="clearAllHistory">
						清空全部
					</n-button>
				</div>
			</div>

			<div v-if="historyList.length === 0" class="text-sm text-gray-400 italic">
				暂无历史记录，填写配置后点击「保存当前」
			</div>
			<div v-else class="space-y-2 max-h-52 overflow-y-auto">
				<div
					v-for="item in historyList"
					:key="item.id"
					class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 group hover:border-blue-300 hover:bg-blue-50/50 transition"
				>
					<button
						class="text-left flex-1 min-w-0 text-sm text-gray-700 truncate"
						title="点击加载此配置"
						@click="applyHistory(item)"
					>
						<span class="font-medium">{{ presets[item.preset]?.label ?? item.preset }}</span>
						<span class="mx-1 text-gray-300">|</span>
						<span class="font-mono text-xs text-gray-500">{{ item.baseUrl.replace(/^https?:\/\//, '') }}</span>
						<span class="ml-2 text-xs text-gray-400">{{ new Date(item.createdAt).toLocaleString('zh-CN') }}</span>
					</button>
					<n-button
						class="opacity-0 group-hover:opacity-100 transition shrink-0"
						size="tiny"
						text
						type="error"
						@click="deleteHistory(item.id)"
					>
						✕
					</n-button>
				</div>
			</div>
		</section>

		<!-- Section 1: API 配置 -->
		<section>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">API 配置</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">API 格式</label>
					<n-select v-model:value="selectedPreset" :options="presetOptions" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
					<n-input v-model:value="baseUrl" placeholder="https://api.openai.com" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">认证方式</label>
					<n-select v-model:value="authType" :options="authTypeOptions" />
				</div>
				<div v-if="authType === 'header'">
					<label class="block text-sm font-medium text-gray-700 mb-1">Header 名称</label>
					<n-input v-model:value="customHeaderName" placeholder="X-API-Key" />
				</div>
			</div>

			<div class="mt-4">
				<label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
				<n-input
					v-model:value="apiKey"
					:placeholder="authType === 'query' ? 'your-api-key' : 'sk-...'"
					show-password-toggle
					type="password"
				/>
			</div>

			<div class="mt-4 flex items-center gap-3">
				<n-switch v-model:value="useProxy" />
				<span class="text-sm font-medium text-gray-700">通过本地代理请求</span>
				<span class="text-xs text-gray-400">绕过 CORS 和 HTTP/HTTPS 混合内容限制</span>
			</div>

			<div class="flex flex-wrap gap-3 mt-4">
				<n-button size="small" type="primary" @click="testConnection"> 测试连接 </n-button>
				<n-button size="small" type="success" @click="fetchModels"> 获取模型列表 </n-button>
			</div>

			<n-alert
				v-if="connectionStatus !== 'idle'"
				:title="connectionMessage"
				:type="alertType(connectionStatus)"
				class="mt-3"
			/>
		</section>

		<!-- Section 2: 模型列表 -->
		<section v-if="models.length > 0">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">
				可用模型 <span class="text-sm font-normal text-gray-500">({{ models.length }})</span>
			</h2>
			<div class="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-60 overflow-y-auto">
				<div class="flex flex-wrap gap-2">
					<n-tag
						v-for="m in models"
						:key="m"
						:type="testModel === m ? 'primary' : 'default'"
						class="cursor-pointer"
						@click="testModel = m"
					>
						{{ m }}
					</n-tag>
				</div>
			</div>
			<n-alert v-if="modelsStatus !== 'idle'" :title="modelsMessage" :type="alertType(modelsStatus)" class="mt-2" />
		</section>

		<!-- Section 3: 测试对话 -->
		<section>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">测试对话</h2>
			<div class="grid grid-cols-1 gap-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
					<n-input v-model:value="testModel" placeholder="gpt-4o-mini" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">测试 Prompt</label>
					<n-input v-model:value="testPrompt" :autosize="{ minRows: 3 }" type="textarea" />
				</div>
			</div>
			<n-button :loading="testStatus === 'loading'" class="mt-4" size="small" type="primary" @click="sendTestMessage">
				发送消息
			</n-button>
			<div v-if="testStatus !== 'idle'" class="mt-4">
				<n-alert :title="testMessage" :type="alertType(testStatus)" />
				<div
					v-if="testResponse"
					class="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-gray-800 max-h-80 overflow-y-auto"
				>
					{{ testResponse }}
				</div>
			</div>
		</section>
	</div>
</template>
