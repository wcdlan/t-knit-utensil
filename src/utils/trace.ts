// 路由追踪前端封装：调用服务端 /api/net/trace 接口执行 traceroute / tracert
// （浏览器无法收发 ICMP 超时报文，实际探测逻辑见 server/trace.ts）。

import type {
	TraceHop,
	TraceRequest,
	TraceResponse,
	TraceResult,
	TraceStatus,
	TraceStatusResponse
} from '@/types/trace';

export type { TraceHop, TraceResult, TraceRequest, TraceStatus } from '@/types/trace';

/** 统一的接口请求封装：网络异常、非 JSON 响应与业务错误都转换为可读中文提示 */
async function requestJson<T extends { ok: boolean; error?: string }>(url: string, init?: RequestInit): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url, init);
	} catch {
		throw new Error('无法连接后端服务，请通过 pnpm dev 或已部署的 API 服务访问本工具');
	}

	const data = (await res.json().catch(() => null)) as T | null;
	if (!data) {
		throw new Error(`后端服务返回异常（HTTP ${res.status}），请确认 API 服务已启动`);
	}
	if (!res.ok || !data.ok) {
		throw new Error(data.error || `请求失败（HTTP ${res.status}）`);
	}
	return data;
}

/**
 * 查询部署服务器是否具备 traceroute / tracert 命令。
 * 失败时按不可用处理，由页面给出安装提示。
 */
export async function fetchTraceStatus(): Promise<TraceStatus> {
	try {
		const data = await requestJson<TraceStatusResponse>('/api/net/trace/check');
		return {
			available: !!data.available,
			command: data.command ?? null,
			platform: data.platform ?? ''
		};
	} catch {
		return { available: false, command: null, platform: '' };
	}
}

/** 执行路由追踪（逐跳探测网络路由） */
export async function traceRoute(request: TraceRequest): Promise<TraceResult> {
	const data = await requestJson<TraceResponse>('/api/net/trace', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});
	if (!data.result) throw new Error('路由追踪服务未返回结果');
	return data.result;
}

/** 单次探测延迟文案（无响应显示 *） */
export function formatProbeLatency(latencyMs: number | null): string {
	return typeof latencyMs === 'number' ? `${latencyMs} ms` : '*';
}

/** 一跳的全部探测延迟文案，如「1.51 ms / * / 2.03 ms」 */
export function formatHopLatencies(hop: TraceHop): string {
	return hop.probes.map((probe) => formatProbeLatency(probe.latencyMs)).join(' / ');
}

/** 一跳的平均延迟（仅统计有响应的探测），无响应返回 null */
export function averageHopLatency(hop: TraceHop): number | null {
	const values = hop.probes
		.map((probe) => probe.latencyMs)
		.filter((value): value is number => typeof value === 'number');
	if (!values.length) return null;
	return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

/** 跃点结果转纯文本（复制全部用，形如 traceroute 输出） */
export function formatTraceText(result: TraceResult): string {
	const lines: string[] = [
		`目标 ${result.host} (${result.ip}) [IPv${result.family}]，共 ${result.hops.length} 跳，${result.reached ? '已到达目标' : '未到达目标'}，耗时 ${result.durationMs} ms`
	];
	for (const hop of result.hops) {
		const address = hop.ip ?? '*';
		const name = hop.hostname ? ` (${hop.hostname})` : '';
		const latencies = hop.probes
			.map((probe) => (typeof probe.latencyMs === 'number' ? `${probe.latencyMs} ms` : '*'))
			.join('  ');
		lines.push(`${String(hop.hop).padStart(2, ' ')}  ${address}${name}  ${latencies}`);
	}
	return lines.join('\n');
}
