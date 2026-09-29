// 路由追踪（traceroute / tracert）相关类型

/** 单次探测结果（一跳通常会连续探测多次） */
export interface TraceProbe {
	/** 该次探测的应答 IP（无响应为 null） */
	ip: string | null;
	/** 往返延迟（毫秒），无响应为 null */
	latencyMs: number | null;
}

/** 单个跃点的状态 */
export type TraceHopStatus = 'ok' | 'timeout' | 'error';

/** 单个跃点（一跳） */
export interface TraceHop {
	/** 跳数（TTL，从 1 开始） */
	hop: number;
	/** 主应答 IP（首个有响应的探测） */
	ip: string | null;
	/** 该跳所有应答 IP（负载均衡时可能有多个） */
	ips: string[];
	/** PTR 反查得到的主机名 */
	hostname: string | null;
	/** 每次探测的详细结果 */
	probes: TraceProbe[];
	/** 跳状态：有响应 / 无响应 / 异常标注 */
	status: TraceHopStatus;
	/** 备注（不可达代码、其他应答 IP 等） */
	detail?: string;
	/** 是否为目标主机所在跳 */
	reached: boolean;
}

/** 路由追踪结果 */
export interface TraceResult {
	/** 目标主机名 / IP（用户输入） */
	host: string;
	/** 目标解析到的 IP */
	ip: string;
	/** 目标地址族（4 / 6） */
	family: 4 | 6;
	/** 最大跳数 */
	maxHops: number;
	/** 每跳探测次数 */
	probes: number;
	/** 是否到达目标 */
	reached: boolean;
	/** 是否因超出时间预算被提前结束（结果不完整） */
	truncated: boolean;
	/** 跃点列表 */
	hops: TraceHop[];
	/** 总耗时（毫秒） */
	durationMs: number;
	/** 实际执行的命令 */
	command: string;
	/** 原始输出 */
	raw: string;
}

/** /api/net/trace 响应 */
export interface TraceResponse {
	ok: boolean;
	result?: TraceResult;
	error?: string;
	code?: string;
}

/** 服务端路由追踪能力状态 */
export interface TraceStatus {
	/** 是否可用 traceroute / tracert 命令 */
	available: boolean;
	/** 实际使用的命令 */
	command: string | null;
	/** 服务端平台 */
	platform: string;
}

/** /api/net/trace/check 响应 */
export interface TraceStatusResponse extends Partial<TraceStatus> {
	ok: boolean;
	error?: string;
}

/** 路由追踪请求参数 */
export interface TraceRequest {
	host: string;
	maxHops: number;
	probes: number;
	resolveNames: boolean;
}
