export interface ApiPreset {
	key: string;
	label: string;
	defaultBaseUrl: string;
	modelsPath: string;
	modelListKey: string;
	headers: (apiKey: string) => Record<string, string>;
	buildTestBody: (model: string) => unknown;
	parseModels: (data: unknown) => string[];
}

export interface HistoryItem {
	id: string;
	preset: string;
	baseUrl: string;
	authType: string;
	apiKey: string;
	customHeaderName: string;
	useProxy: boolean;
	createdAt: number;
}

export type TestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse {
	ok: boolean;
	status: number;
	json: () => Promise<any>;
	text: () => Promise<string>;
}
