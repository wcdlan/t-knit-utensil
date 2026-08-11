<script lang="ts" setup>
	import { computed, ref, watch } from 'vue' // ---- 预设的 API 格式 ----

	// ---- 预设的 API 格式 ----
	interface ApiPreset {
		key: string
		label: string
		defaultBaseUrl: string
		modelsPath: string
		modelListKey: string // JSON 响应中取出模型列表的路径，如 'data' 或 'models' 或 ''
		headers: (apiKey: string) => Record<string, string>
		buildTestBody: (model: string) => unknown
		parseModels: (data: unknown) => string[]
	}

	const presets: Record<string, ApiPreset> = {
		openai: {
			key: 'openai',
			label: 'OpenAI 兼容',
			defaultBaseUrl: 'https://api.openai.com',
			modelsPath: '/v1/models',
			modelListKey: 'data',
			headers: (apiKey) => ({
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}),
			buildTestBody: (model) => ({
				model,
				messages: [{ role: 'user', content: 'Hi, respond with just "OK".' }],
				max_tokens: 10
			}),
			parseModels: (data: any) => {
				const list = data?.data ?? data
				if (Array.isArray(list)) return list.map((m: any) => m.id ?? m.name ?? String(m)).filter(Boolean)
				return []
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
				const list = data?.data ?? data
				if (Array.isArray(list)) return list.map((m: any) => m.id ?? m.name ?? String(m)).filter(Boolean)
				return []
			}
		},
		gemini: {
			key: 'gemini',
			label: 'Google Gemini',
			defaultBaseUrl: 'https://generativelanguage.googleapis.com',
			modelsPath: '/v1beta/models',
			modelListKey: 'models',
			headers: (_apiKey) => ({
				'Content-Type': 'application/json'
			}),
			buildTestBody: () => ({}),
			parseModels: (data: any) => {
				const list = data?.models ?? data
				if (Array.isArray(list)) {
					return list
						.map((m: any) => m.name?.replace(/^models\//, '') ?? m.id ?? String(m))
						.filter((n: string) => !n.includes('legacy') && !n.includes('deprecated'))
				}
				return []
			}
		}
	}

	// ---- 表单状态 ----
	const selectedPreset = ref<keyof typeof presets>('openai')
	const baseUrl = ref(presets.openai.defaultBaseUrl)
	const authType = ref<'bearer' | ('header' | 'query')>('bearer')
	const apiKey = ref('')
	const customHeaderName = ref('X-API-Key')

	// ---- 测试状态 ----
	type TestStatus = 'idle' | 'loading' | 'success' | 'error'
	const connectionStatus = ref<TestStatus>('idle')
	const connectionMessage = ref('')
	const modelsStatus = ref<TestStatus>('idle')
	const modelsMessage = ref('')
	const models = ref<string[]>([])

	// ---- 测试对话 ----
	const testModel = ref('')
	const testPrompt = ref('Say "Hello, I am working!" in one sentence.')
	const testResponse = ref('')
	const testStatus = ref<TestStatus>('idle')
	const testMessage = ref('')

	// 切换格式时更新默认 URL
	watch(selectedPreset, (key) => {
		baseUrl.value = presets[key].defaultBaseUrl
		if (key === 'anthropic') {
			authType.value = 'header'
			customHeaderName.value = 'x-api-key'
		} else {
			authType.value = 'bearer'
		}
		// 重置状态
		connectionStatus.value = 'idle'
		connectionMessage.value = ''
		modelsStatus.value = 'idle'
		modelsMessage.value = ''
		models.value = []
		testStatus.value = 'idle'
		testResponse.value = ''
		testMessage.value = ''
	})

	const preset = computed(() => presets[selectedPreset.value])

	function buildHeaders(): Record<string, string> {
		return preset.value.headers(apiKey.value)
	}

	function getFullUrl(path: string): string {
		let url = baseUrl.value.replace(/\/+$/, '')
		if (authType.value === 'query' && apiKey.value) {
			url += path + (path.includes('?') ? '&' : '?') + `key=${encodeURIComponent(apiKey.value)}`
		} else {
			url += path
		}
		return url
	}

	// ---- 测试连接 ----
	async function testConnection() {
		if (!apiKey.value.trim()) {
			connectionStatus.value = 'error'
			connectionMessage.value = '请先填写 API Key'
			return
		}
		connectionStatus.value = 'loading'
		connectionMessage.value = '正在连接...'

		try {
			const headers = buildHeaders()
			const resp = await fetch(getFullUrl(preset.value.modelsPath), {
				method: 'GET',
				headers
			})

			if (resp.ok) {
				connectionStatus.value = 'success'
				connectionMessage.value = `连接成功 (HTTP ${resp.status})`
			} else {
				const body = await resp.text().catch(() => '')
				connectionStatus.value = 'error'
				connectionMessage.value = `HTTP ${resp.status}: ${body.slice(0, 200) || resp.statusText}`
			}
		} catch (e: any) {
			connectionStatus.value = 'error'
			// 检查是否为 CORS 错误
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
				connectionMessage.value =
					'网络错误：可能是 CORS 限制或 URL 不可达。浏览器端请求可能被服务端拒绝，建议检查网络或使用代理。'
			} else {
				connectionMessage.value = `请求失败: ${e.message}`
			}
		}
	}

	// ---- 获取模型列表 ----
	async function fetchModels() {
		if (!apiKey.value.trim()) {
			modelsStatus.value = 'error'
			modelsMessage.value = '请先填写 API Key'
			return
		}
		modelsStatus.value = 'loading'
		modelsMessage.value = '正在获取模型列表...'

		try {
			const headers = buildHeaders()
			const resp = await fetch(getFullUrl(preset.value.modelsPath), {
				method: 'GET',
				headers
			})

			if (!resp.ok) {
				const body = await resp.text().catch(() => '')
				modelsStatus.value = 'error'
				modelsMessage.value = `HTTP ${resp.status}: ${body.slice(0, 200)}`
				return
			}

			const data = await resp.json()
			models.value = preset.value.parseModels(data)

			if (models.value.length === 0) {
				modelsStatus.value = 'success'
				modelsMessage.value = '未解析到模型数据，请查看原始响应'
			} else {
				modelsStatus.value = 'success'
				modelsMessage.value = `共获取到 ${models.value.length} 个模型`
			}
		} catch (e: any) {
			modelsStatus.value = 'error'
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
				modelsMessage.value = '网络错误：可能是 CORS 限制。请确认 API 端点支持跨域请求。'
			} else {
				modelsMessage.value = `请求失败: ${e.message}`
			}
		}
	}

	// ---- 发送测试消息 ----
	async function sendTestMessage() {
		if (!apiKey.value.trim()) {
			testStatus.value = 'error'
			testMessage.value = '请先填写 API Key'
			return
		}
		const model = testModel.value.trim() || (models.value[0] ?? '')
		if (!model) {
			testStatus.value = 'error'
			testMessage.value = '请选择一个模型或手动输入模型名称'
			return
		}

		testStatus.value = 'loading'
		testMessage.value = '正在发送...'
		testResponse.value = ''

		try {
			const headers = buildHeaders()

			let chatPath = '/v1/chat/completions'
			let body: unknown

			if (selectedPreset.value === 'anthropic') {
				chatPath = '/v1/messages'
				body = {
					model,
					max_tokens: 100,
					messages: [{ role: 'user', content: testPrompt.value }]
				}
			} else if (selectedPreset.value === 'gemini') {
				chatPath = `/v1beta/models/${model}:generateContent`
				body = {
					contents: [{ parts: [{ text: testPrompt.value }] }]
				}
			} else {
				body = {
					model,
					messages: [{ role: 'user', content: testPrompt.value }],
					max_tokens: 100
				}
			}

			const resp = await fetch(getFullUrl(chatPath), {
				method: 'POST',
				headers,
				body: JSON.stringify(body)
			})

			const data = await resp.json().catch(() => null)

			if (!resp.ok) {
				testStatus.value = 'error'
				testMessage.value = `HTTP ${resp.status}: ${JSON.stringify(data?.error ?? data ?? resp.statusText).slice(0, 300)}`
				return
			}

			// 解析不同格式的响应
			let content = ''
			if (selectedPreset.value === 'gemini') {
				content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data)
			} else if (selectedPreset.value === 'anthropic') {
				content = data?.content?.[0]?.text ?? JSON.stringify(data)
			} else {
				content = data?.choices?.[0]?.message?.content ?? JSON.stringify(data)
			}

			testResponse.value = content
			testStatus.value = 'success'
			testMessage.value = '响应成功'
		} catch (e: any) {
			testStatus.value = 'error'
			if (e.message?.includes('Failed to fetch') || e.name === 'TypeError') {
				testMessage.value = '网络错误：可能是 CORS 限制。浏览器端请求可能被服务端拒绝。'
			} else {
				testMessage.value = `请求失败: ${e.message}`
			}
		}
	}
</script>

<template>
	<div class="space-y-6">
		<!-- Section 1: API 配置 -->
		<section>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">API 配置</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- API 格式 -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">API 格式</label>
					<select
						v-model="selectedPreset"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
					>
						<option v-for="(p, k) in presets" :key="k" :value="k">{{ p.label }}</option>
					</select>
				</div>

				<!-- Base URL -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
					<input
						v-model="baseUrl"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
						placeholder="https://api.openai.com"
						type="text"
					/>
				</div>

				<!-- 认证方式 -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">认证方式</label>
					<select
						v-model="authType"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
					>
						<option value="bearer">Bearer Token (Authorization: Bearer)</option>
						<option value="header">自定义 Header</option>
						<option value="query">Query 参数 (?key=)</option>
					</select>
				</div>

				<!-- 自定义 Header 名称 (仅在 header 模式) -->
				<div v-if="authType === 'header'">
					<label class="block text-sm font-medium text-gray-700 mb-1">Header 名称</label>
					<input
						v-model="customHeaderName"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
						placeholder="X-API-Key"
						type="text"
					/>
				</div>
			</div>

			<!-- API Key -->
			<div class="mt-4">
				<label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
				<input
					v-model="apiKey"
					:placeholder="authType === 'query' ? 'your-api-key' : 'sk-...'"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
					type="password"
				/>
			</div>

			<!-- 操作按钮 -->
			<div class="flex flex-wrap gap-3 mt-4">
				<button
					:disabled="connectionStatus === 'loading'"
					class="px-4 py-2 rounded-lg text-sm font-medium transition bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
					@click="testConnection"
				>
					测试连接
				</button>
				<button
					:disabled="modelsStatus === 'loading'"
					class="px-4 py-2 rounded-lg text-sm font-medium transition bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
					@click="fetchModels"
				>
					获取模型列表
				</button>
			</div>

			<!-- 连接状态 -->
			<div v-if="connectionStatus !== 'idle'" class="mt-3">
				<div
					:class="{
						'bg-green-50 border-green-300 text-green-800': connectionStatus === 'success',
						'bg-red-50 border-red-300 text-red-800': connectionStatus === 'error',
						'bg-blue-50 border-blue-300 text-blue-800': connectionStatus === 'loading'
					}"
					class="border rounded-lg px-4 py-3 text-sm"
				>
					<span v-if="connectionStatus === 'loading'" class="inline-block animate-spin mr-2">⏳</span>
					<span v-else-if="connectionStatus === 'success'">✅</span>
					<span v-else>❌</span>
					<span class="ml-1">{{ connectionMessage }}</span>
				</div>
			</div>
		</section>

		<!-- Section 2: 模型列表 -->
		<section v-if="models.length > 0">
			<h2 class="text-lg font-semibold text-gray-800 mb-3">
				可用模型
				<span class="text-sm font-normal text-gray-500">({{ models.length }})</span>
			</h2>
			<div class="bg-gray-50 rounded-lg border border-gray-200 p-3 max-h-60 overflow-y-auto">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
					<button
						v-for="m in models"
						:key="m"
						:class="{
							'bg-blue-50 text-blue-700 border-blue-300': testModel === m,
							'bg-white text-gray-700': testModel !== m
						}"
						class="text-left px-3 py-1.5 rounded text-sm font-mono truncate transition hover:bg-blue-100 hover:text-blue-700 cursor-pointer border border-transparent hover:border-blue-300"
						@click="testModel = m"
					>
						{{ m }}
					</button>
				</div>
			</div>
			<div v-if="modelsStatus !== 'idle'" class="mt-2">
				<p
					:class="{
						'text-green-600': modelsStatus === 'success',
						'text-red-600': modelsStatus === 'error',
						'text-blue-600': modelsStatus === 'loading'
					}"
					class="text-sm"
				>
					{{ modelsMessage }}
				</p>
			</div>
		</section>

		<!-- Section 3: 测试对话 -->
		<section>
			<h2 class="text-lg font-semibold text-gray-800 mb-4">测试对话</h2>

			<div class="grid grid-cols-1 gap-4">
				<!-- 模型选择 -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
					<input
						v-model="testModel"
						:list="models.length ? 'models-list' : undefined"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
						placeholder="gpt-4o-mini"
						type="text"
					/>
					<datalist v-if="models.length" id="models-list">
						<option v-for="m in models" :key="m" :value="m" />
					</datalist>
				</div>

				<!-- Prompt -->
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">测试 Prompt</label>
					<textarea
						v-model="testPrompt"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
						rows="3"
					></textarea>
				</div>
			</div>

			<button
				:disabled="testStatus === 'loading'"
				class="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
				@click="sendTestMessage"
			>
				发送消息
			</button>

			<!-- 响应 -->
			<div v-if="testStatus !== 'idle'" class="mt-4">
				<div
					:class="{
						'bg-green-50 border-green-300': testStatus === 'success',
						'bg-red-50 border-red-300': testStatus === 'error',
						'bg-blue-50 border-blue-300': testStatus === 'loading'
					}"
					class="border rounded-lg px-4 py-3 text-sm"
				>
					<p
						:class="{
							'text-green-700': testStatus === 'success',
							'text-red-700': testStatus === 'error',
							'text-blue-700': testStatus === 'loading'
						}"
					>
						{{ testMessage }}
					</p>
				</div>
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

<style scoped>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
