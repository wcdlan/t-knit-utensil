// 网络解析工具前端封装：DNS 记录解析、系统 DNS 状态与 PING 探测统一走服务端 /api/dns/* 接口
// 浏览器无法直接发起 DNS 查询与 ICMP 探测，实际解析逻辑见 server/dns.ts。

import type {
	DnsLookupType,
	DnsRecord,
	DnsResolveResponse,
	DnsResolveResult,
	DnsServerStatus,
	DnsServerStatusResponse,
	PingRequest,
	PingResponse,
	PingResult
} from '@/types/dns';

export type { DnsLookupType, DnsRecord, DnsResolveResult, DnsServerStatus, PingRequest, PingResult } from '@/types/dns';

/**
 * 统一的接口请求封装：网络异常、非 JSON 响应与业务错误都转换为可读中文提示。
 */
async function requestJson<T extends { ok: boolean; error?: string }>(url: string, init?: RequestInit): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url, init);
	} catch {
		throw new Error('无法连接后端解析服务，请通过 pnpm dev 或已部署的 API 服务访问本工具');
	}

	const data = (await res.json().catch(() => null)) as T | null;
	if (!data) {
		throw new Error(`解析服务返回异常（HTTP ${res.status}），请确认后端 API 服务已启动`);
	}
	if (!res.ok || !data.ok) {
		throw new Error(data.error || `请求失败（HTTP ${res.status}）`);
	}
	return data;
}

/**
 * 查询部署服务器的系统默认 DNS 列表与 ping 可用性。
 * 失败时返回空列表（面板仅提示未获取到，不阻断解析功能）。
 */
export async function fetchDnsServerStatus(): Promise<DnsServerStatus> {
	try {
		const data = await requestJson<DnsServerStatusResponse>('/api/dns/servers');
		return {
			servers: data.servers ?? [],
			platform: data.platform ?? '',
			pingAvailable: !!data.pingAvailable
		};
	} catch {
		return { servers: [], platform: '', pingAvailable: false };
	}
}

/**
 * 解析 DNS 记录：server 为空字符串时使用系统默认 DNS，否则以该服务器直连查询。
 */
export async function lookupDnsRecord(name: string, type: DnsLookupType, server: string): Promise<DnsResolveResult> {
	const data = await requestJson<DnsResolveResponse>('/api/dns/resolve', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, type, server })
	});
	if (!data.result) throw new Error('解析服务未返回结果');
	return data.result;
}

/**
 * 主机可达性探测：icmp 调用服务端 ping 命令，tcp 对指定端口发起连接探测。
 */
export async function pingTarget(request: PingRequest): Promise<PingResult> {
	const data = await requestJson<PingResponse>('/api/dns/ping', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});
	if (!data.result) throw new Error('探测服务未返回结果');
	return data.result;
}

/** 记录列表转纯文本（复制全部用，MX 记录带上优先级前缀） */
export function formatRecordsText(records: DnsRecord[], type: DnsLookupType): string {
	return records.map((record) => (type === 'MX' ? `${record.priority ?? 0} ${record.value}` : record.value)).join('\n');
}

/** TTL 展示文案 */
export function formatTtl(ttl: number | null): string {
	return typeof ttl === 'number' ? `${ttl} 秒` : '—';
}

/** 延迟展示文案 */
export function formatLatency(latencyMs: number | null): string {
	return typeof latencyMs === 'number' ? `${latencyMs} ms` : '—';
}
