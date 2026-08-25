// AI API 测试器：预设 API 格式定义与历史记录工具函数
import type { ApiPreset, HistoryItem } from '@/types/ai';

/** 预设的 API 格式 */
export const AI_PRESETS: Record<string, ApiPreset> = {
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

/** 历史记录 localStorage key */
export const AI_HISTORY_KEY = 'ai-api-tester-history';

export function loadHistory(): HistoryItem[] {
	try {
		const raw = localStorage.getItem(AI_HISTORY_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveHistory(list: HistoryItem[]) {
	localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(list));
}

export function generateId(): string {
	return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function configsEqual(a: HistoryItem, b: Omit<HistoryItem, 'id' | 'createdAt'>): boolean {
	return (
		a.preset === b.preset &&
		a.baseUrl === b.baseUrl &&
		a.authType === b.authType &&
		a.apiKey === b.apiKey &&
		a.customHeaderName === b.customHeaderName &&
		a.useProxy === b.useProxy
	);
}
