// 网络解析工具相关类型（DNS 记录查询 / PTR 反向解析 / PING 探测）

/** 支持的 DNS 记录类型（不含 PING 探测） */
export type DnsLookupType = 'A' | 'CNAME' | 'MX' | 'NS' | 'TXT' | 'PTR';

/** 网络解析工具的子工具键（记录查询 + PING 检测） */
export type DnsToolKey = DnsLookupType | 'PING';

/** DNS 服务器选择键（system 为系统默认，custom 为手动输入） */
export type DnsServerKey = string;

/** PING 探测方式 */
export type PingMode = 'icmp' | 'tcp';

/** 单次探测结果状态 */
export type PingAttemptStatus = 'ok' | 'refused' | 'timeout' | 'error';

/** 单条 DNS 解析记录 */
export interface DnsRecord {
	/** 记录值（A 记录为 IP、MX 为交换主机、TXT 为文本内容…） */
	value: string;
	/** TTL（秒），无法获取时为 null */
	ttl: number | null;
	/** MX 优先级，仅 MX 记录有值 */
	priority?: number;
}

/** DNS 解析结果 */
export interface DnsResolveResult {
	/** 查询名称 */
	name: string;
	/** 记录类型 */
	type: DnsLookupType;
	/** 使用的 DNS 服务器（系统默认为「系统默认」） */
	server: string;
	/** 实际查询使用的 DNS 服务器列表 */
	servers: string[];
	/** 查询耗时（毫秒） */
	durationMs: number;
	/** 解析记录 */
	records: DnsRecord[];
}

/** /api/dns/resolve 响应 */
export interface DnsResolveResponse {
	ok: boolean;
	result?: DnsResolveResult;
	error?: string;
	code?: string;
}

/** 服务端 DNS 环境状态（系统默认 DNS 列表与 ping 可用性） */
export interface DnsServerStatus {
	servers: string[];
	platform: string;
	pingAvailable: boolean;
}

/** /api/dns/servers 响应 */
export interface DnsServerStatusResponse extends Partial<DnsServerStatus> {
	ok: boolean;
	error?: string;
}

/** 单次探测结果 */
export interface PingAttempt {
	index: number;
	status: PingAttemptStatus;
	latencyMs: number | null;
	detail?: string;
}

/** PING 探测结果 */
export interface PingResult {
	host: string;
	ip: string;
	mode: PingMode;
	port: number | null;
	sent: number;
	received: number;
	lossRate: number;
	min: number | null;
	avg: number | null;
	max: number | null;
	attempts: PingAttempt[];
	raw?: string;
}

/** /api/dns/ping 响应 */
export interface PingResponse {
	ok: boolean;
	result?: PingResult;
	error?: string;
	code?: string;
}

/** PING 探测请求参数 */
export interface PingRequest {
	host: string;
	mode: PingMode;
	port: number;
	count: number;
	timeoutMs: number;
}

/** DNS 服务器预设（公共 DNS 提供商） */
export interface DnsServerPreset {
	/** 唯一键（system / custom / 供应商标识） */
	key: DnsServerKey;
	/** 展示名称 */
	label: string;
	/** 服务器地址（system / custom 为空字符串，由输入框补充） */
	address: string;
	/** 说明文案 */
	description: string;
}

/** 子工具页签元数据（标题、图标、输入提示与示例） */
export interface DnsToolMeta {
	/** 子工具键 */
	key: DnsToolKey;
	/** 页签名称 */
	label: string;
	/** 图标名（icons 注册表） */
	icon: string;
	/** 输入框标签 */
	inputLabel: string;
	/** 输入框 placeholder */
	placeholder: string;
	/** 输入框下方的说明文案 */
	hint: string;
	/** 快捷示例值 */
	examples: string[];
}
