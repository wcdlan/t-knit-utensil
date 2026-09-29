// DNS 记录解析与 PING 探测的服务端逻辑
// 由 server/index.ts（生产 API）与 vite-plugin-config.ts（dev 中间件）共享。
// 浏览器无法直接发起 DNS 查询与 ICMP 探测，因此解析与探测统一放在 Node 端执行。

import { spawn } from 'node:child_process';
import net from 'node:net';
import { getServers, lookup, Resolver } from 'node:dns/promises';
import { domainToASCII } from 'node:url';

/** 支持的 DNS 记录类型（不含 PING 探测） */
export type DnsLookupType = 'A' | 'CNAME' | 'MX' | 'NS' | 'TXT' | 'PTR';

/** 单条解析记录（归一化后返回给前端） */
export interface DnsRecord {
	/** 记录值（A 记录为 IP、MX 为交换主机、TXT 为文本内容…） */
	value: string;
	/** TTL（秒），无法获取时为 null */
	ttl: number | null;
	/** MX 优先级，仅 MX 记录有值 */
	priority?: number;
}

/** DNS 解析结果 */
export interface DnsResolveOutcome {
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

/** 服务端 DNS 环境状态 */
export interface DnsServerStatus {
	/** 系统默认 DNS 服务器列表 */
	servers: string[];
	/** 服务端平台（linux / darwin / win32） */
	platform: string;
	/** 是否可用 ICMP ping（无 ping 命令时只能用 TCP 探测） */
	pingAvailable: boolean;
}

/** 探测方式：ICMP ping 或 TCP 端口探测 */
export type PingMode = 'icmp' | 'tcp';

/** 单次探测结果状态 */
export type PingAttemptStatus = 'ok' | 'refused' | 'timeout' | 'error';

/** 单次探测结果 */
export interface PingAttempt {
	/** 第几次 */
	index: number;
	/** 状态：成功 / 端口未开放但主机可达 / 超时 / 错误 */
	status: PingAttemptStatus;
	/** 往返延迟（毫秒），超时或错误为 null */
	latencyMs: number | null;
	/** 补充说明 */
	detail?: string;
}

/** PING 探测结果 */
export interface PingOutcome {
	/** 目标主机名 */
	host: string;
	/** 解析出的目标 IP */
	ip: string;
	/** 探测方式 */
	mode: PingMode;
	/** TCP 探测端口（ICMP 模式为 null） */
	port: number | null;
	/** 探测次数 */
	sent: number;
	/** 可达次数（含端口未开放但主机可达） */
	received: number;
	/** 丢包率（百分比，保留 1 位小数） */
	lossRate: number;
	/** 最小延迟（毫秒） */
	min: number | null;
	/** 平均延迟（毫秒） */
	avg: number | null;
	/** 最大延迟（毫秒） */
	max: number | null;
	/** 每次探测详情 */
	attempts: PingAttempt[];
	/** 原始命令输出（ICMP 模式，便于排查解析失败的情况） */
	raw?: string;
}

/** 解析请求载荷 */
export interface DnsResolvePayload {
	name: string;
	type: DnsLookupType;
	server?: string;
}

/** PING 请求载荷 */
export interface PingPayload {
	host: string;
	mode?: PingMode;
	port?: number;
	count?: number;
	timeoutMs?: number;
}

/** 接口统一返回结构 */
export interface DnsHandlerResult {
	status: number;
	body: unknown;
}

/** PING 次数上限（避免长时间占用连接） */
const MAX_PING_COUNT = 10;

/** 默认 PING 次数 */
const DEFAULT_PING_COUNT = 4;

/** 单次探测默认超时（毫秒） */
const DEFAULT_PING_TIMEOUT_MS = 3000;

/** TCP 探测默认端口 */
const DEFAULT_TCP_PORT = 443;

/** 判定记录类型是否受支持 */
export function isValidLookupType(value: string): value is DnsLookupType {
	return value === 'A' || value === 'CNAME' || value === 'MX' || value === 'NS' || value === 'TXT' || value === 'PTR';
}

/** 校验并规范化 DNS 服务器地址（支持 IPv4、IPv6、IP:端口、[IPv6]:端口） */
export function normalizeDnsServer(input: string): string {
	const value = input.trim();
	if (!value) throw new Error('DNS 服务器地址不能为空');

	const bracket = value.match(/^\[([0-9a-fA-F:.]+)\](?::(\d{1,5}))?$/);
	if (bracket) return joinServer(bracket[1], bracket[2]);
	if (net.isIPv4(value) || net.isIPv6(value)) return value;

	const withPort = value.match(/^(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})$/);
	if (withPort && net.isIPv4(withPort[1])) return joinServer(withPort[1], withPort[2]);

	throw new Error('DNS 服务器地址格式不正确，请填写形如 223.5.5.5、1.1.1.1 或 127.0.0.1:5353 的地址');
}

/** 拼接 IP 与端口（IPv6 自动加方括号） */
function joinServer(host: string, port?: string): string {
	if (!port) return host;
	const portNumber = Number(port);
	if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
		throw new Error('DNS 服务器端口需在 1-65535 之间');
	}
	return host.includes(':') ? `[${host}]:${portNumber}` : `${host}:${portNumber}`;
}

/** 校验并规范化查询名称（去首尾空白与根点、中文域名转 Punycode） */
function normalizeName(input: string): string {
	let value = (input || '').trim().replace(/\.$/, '');
	if (!value) throw new Error('请输入要解析的域名');
	if (/\s/.test(value)) throw new Error('域名中不能包含空格');
	const ascii = domainToASCII(value);
	if (ascii) value = ascii;
	if (value.length > 253) throw new Error('域名长度超出 253 字符上限');
	return value;
}

/** 校验并规范化 PING 目标（兼容粘贴 URL、带端口与 IPv6 方括号的写法） */
function normalizePingHost(input: string): string {
	let value = (input || '').trim();
	if (!value) throw new Error('请输入要检测的主机名或 IP 地址');
	value = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
	value = value.split('/')[0].split('?')[0];
	if (value.startsWith('[')) {
		const end = value.indexOf(']');
		if (end > 0) value = value.slice(1, end);
	} else if (/:\d+$/.test(value) && value.split(':').length === 2) {
		value = value.replace(/:\d+$/, '');
	}
	if (!value) throw new Error('请输入要检测的主机名或 IP 地址');
	return value;
}

/** 数值参数收敛到合法区间 */
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
	const num = Number(value);
	if (!Number.isFinite(num)) return fallback;
	return Math.min(Math.max(Math.round(num), min), max);
}

/** 把 DNS 报错翻译成中文提示（c-ares 错误码对照） */
export function describeDnsError(error: unknown): { code: string; message: string } {
	const err = error as NodeJS.ErrnoException;
	const code = err?.code || 'UNKNOWN';
	const map: Record<string, string> = {
		ENOTFOUND: '域名不存在（NXDOMAIN），请检查域名拼写或该域名是否已注册',
		ENODATA: '域名存在，但没有所查询类型的记录（NOERROR / 无数据）',
		ESERVFAIL: '上游 DNS 返回 SERVFAIL，通常是权威服务器故障或域名配置异常',
		EREFUSED: 'DNS 服务器拒绝响应（REFUSED），可能禁止了递归查询',
		ETIMEOUT: 'DNS 查询超时，请检查 DNS 服务器地址与网络连通性',
		ETIMEDOUT: 'DNS 查询超时，请检查 DNS 服务器地址与网络连通性',
		ECONNREFUSED: 'DNS 服务器拒绝连接，请确认地址、端口是否正确且已开放 UDP/TCP 53',
		ECONNRESET: '与 DNS 服务器的连接被重置',
		EBADNAME: '域名格式不合法，请输入有效的域名',
		EBADRESP: 'DNS 响应格式异常，无法解析',
		EBADFAMILY: '不支持的地址族',
		EFORMERR: 'DNS 服务器返回格式错误（FORMERR）',
		ENOTIMP: 'DNS 服务器不支持该查询（NOTIMP）',
		ENOTINITIALIZED: 'DNS 解析器未初始化',
		ECANCELLED: '查询已取消',
		EAI_AGAIN: 'DNS 解析临时失败，请稍后重试'
	};
	return { code, message: map[code] ?? `DNS 查询失败（${code}）` };
}

/** 统一提取错误提示：自定义校验错误直接使用 message，c-ares 错误码翻译为中文 */
export function describeError(error: unknown): { code: string; message: string } {
	const err = error as NodeJS.ErrnoException;
	if (!err?.code) {
		return {
			code: 'UNKNOWN',
			message: error instanceof Error && error.message ? error.message : '请求处理失败'
		};
	}
	return describeDnsError(error);
}

/** 带 ttl 选项的解析方法签名（Node 运行时各 resolve* 均支持 ttl，类型定义仅对 resolve4/6 暴露该选项） */
type TtlResolvable = (name: string, options?: { ttl: true }) => Promise<unknown[]>;

/** 以 ttl 选项发起查询（类型层面做一次收敛，运行时行为与普通查询一致） */
function resolveTtl(fn: TtlResolvable, name: string): Promise<unknown[]> {
	return fn(name, { ttl: true });
}

/** 兼容不支持 ttl 选项的运行时：带 ttl 查询因参数校验失败时退回无选项查询 */
async function withTtlFallback(call: () => Promise<unknown[]>, plain: () => Promise<unknown[]>): Promise<unknown[]> {
	try {
		return await call();
	} catch (error) {
		const code = (error as NodeJS.ErrnoException)?.code ?? '';
		if (error instanceof TypeError || code.startsWith('ERR_INVALID')) {
			return await plain();
		}
		throw error;
	}
}

/** 归一化通用记录（兼容字符串与 {address|value, ttl} 两种形态，并剔除上游返回的空占位记录） */
function normalizeRows(rows: unknown[]): DnsRecord[] {
	return rows
		.map((row) => {
			if (typeof row === 'string') return { value: row, ttl: null };
			const item = row as { address?: string; value?: string; ttl?: number };
			return {
				value: String(item.address ?? item.value ?? ''),
				ttl: typeof item.ttl === 'number' ? item.ttl : null
			};
		})
		.filter((record) => record.value !== '');
}

/** 归一化 MX 记录（按优先级升序，优先级越小越优先） */
function normalizeMxRows(rows: unknown[]): DnsRecord[] {
	return rows
		.map((row) => {
			const item = row as { exchange?: string; priority?: number; ttl?: number };
			return {
				value: String(item.exchange ?? ''),
				ttl: typeof item.ttl === 'number' ? item.ttl : null,
				priority: typeof item.priority === 'number' ? item.priority : 0
			};
		})
		.filter((record) => record.value !== '')
		.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
}

/** 归一化 TXT 记录（多段字符串拼接为一条） */
function normalizeTxtRows(rows: unknown[]): DnsRecord[] {
	return rows.map((row) => {
		if (Array.isArray(row)) return { value: row.join(''), ttl: null };
		const item = row as { entries?: string[]; ttl?: number };
		return {
			value: (item.entries ?? []).join(''),
			ttl: typeof item.ttl === 'number' ? item.ttl : null
		};
	});
}

/** 按类型执行解析并归一化结果 */
async function resolveRecords(resolver: Resolver, name: string, type: DnsLookupType): Promise<DnsRecord[]> {
	switch (type) {
		case 'A':
			return normalizeRows(
				await withTtlFallback(
					() => resolveTtl(resolver.resolve4.bind(resolver), name),
					() => resolver.resolve4(name)
				)
			);
		case 'CNAME':
			return normalizeRows(
				await withTtlFallback(
					() => resolveTtl(resolver.resolveCname.bind(resolver), name),
					() => resolver.resolveCname(name)
				)
			);
		case 'MX':
			return normalizeMxRows(
				await withTtlFallback(
					() => resolveTtl(resolver.resolveMx.bind(resolver), name),
					() => resolver.resolveMx(name)
				)
			);
		case 'NS':
			return normalizeRows(
				await withTtlFallback(
					() => resolveTtl(resolver.resolveNs.bind(resolver), name),
					() => resolver.resolveNs(name)
				)
			);
		case 'TXT':
			return normalizeTxtRows(
				await withTtlFallback(
					() => resolveTtl(resolver.resolveTxt.bind(resolver), name),
					() => resolver.resolveTxt(name)
				)
			);
		case 'PTR': {
			if (!net.isIP(name)) throw new Error('PTR 反向解析需要输入 IP 地址（如 8.8.8.8 或 2001:4860:4860::8888）');
			return normalizeRows(await resolver.reverse(name));
		}
	}
}

/**
 * 解析 DNS 记录：未指定 server 时使用系统默认 DNS（等价于 nslookup 不带服务器参数），
 * 指定 server 时以该服务器直连查询（UDP/TCP 53，支持自定义端口）。
 */
export async function resolveDns(params: { name: string; type: string; server?: string }): Promise<DnsResolveOutcome> {
	if (!isValidLookupType(params.type)) throw new Error('不支持的记录类型');
	const name = normalizeName(params.name);
	const custom = params.server?.trim() ? normalizeDnsServer(params.server) : '';

	// timeout / tries 收敛查询等待时间，避免指定了不可达的 DNS 时长时间挂起
	const resolver = new Resolver({ timeout: 3000, tries: 2 });
	if (custom) {
		try {
			resolver.setServers([custom]);
		} catch {
			throw new Error('无法使用该 DNS 服务器地址，请检查地址格式');
		}
	}

	const startedAt = Date.now();
	const records = await resolveRecords(resolver, name, params.type);

	return {
		name,
		type: params.type,
		server: custom || '系统默认',
		servers: custom ? [custom] : getServers(),
		durationMs: Date.now() - startedAt,
		records
	};
}

/** 系统默认 DNS 列表与 ping 可用性 */
export async function getDnsServerStatus(): Promise<DnsServerStatus> {
	return {
		servers: getServers(),
		platform: process.platform,
		pingAvailable: await checkPingAvailable()
	};
}

let pingBinaryCache: Promise<boolean> | null = null;

/** 检测系统是否提供 ping 命令（结果缓存，无 ping 时只能使用 TCP 探测） */
export function checkPingAvailable(): Promise<boolean> {
	if (!pingBinaryCache) {
		pingBinaryCache = new Promise<boolean>((resolve) => {
			const child = spawn('ping', pingArgs(1, 1000, '127.0.0.1'), { stdio: 'ignore' });
			child.on('error', () => resolve(false));
			child.on('close', () => resolve(true));
		});
	}
	return pingBinaryCache;
}

/** 构造各平台 ping 命令参数（Linux 的 -W 为秒，macOS / Windows 为毫秒） */
function pingArgs(count: number, timeoutMs: number, host: string): string[] {
	if (process.platform === 'win32') return ['-n', String(count), '-w', String(timeoutMs), host];
	if (process.platform === 'darwin') return ['-c', String(count), '-W', String(timeoutMs), host];
	return ['-c', String(count), '-W', String(Math.max(1, Math.round(timeoutMs / 1000))), host];
}

/** 执行系统 ping 命令并收集输出（exitCode 为 null 表示命令无法执行） */
function runIcmpPing(
	host: string,
	count: number,
	timeoutMs: number
): Promise<{ output: string; exitCode: number | null }> {
	return new Promise((resolve) => {
		const child = spawn('ping', pingArgs(count, timeoutMs, host));
		let output = '';
		const collect = (chunk: unknown) => (output += String(chunk));
		child.stdout?.on('data', collect);
		child.stderr?.on('data', collect);

		// 兜底超时：命令异常挂起时强制结束
		const timer = setTimeout(() => child.kill('SIGKILL'), count * timeoutMs + 5000);

		child.on('error', () => {
			clearTimeout(timer);
			resolve({ output, exitCode: null });
		});
		child.on('close', (code) => {
			clearTimeout(timer);
			resolve({ output, exitCode: code });
		});
	});
}

/** 解析 ping 输出：兼容 Linux / macOS / Windows（含中文 Windows）格式 */
function parseIcmpOutput(
	host: string,
	count: number,
	output: string,
	exitCode: number | null
): {
	ip: string;
	attempts: PingAttempt[];
	sent: number;
	received: number;
	min: number | null;
	avg: number | null;
	max: number | null;
} {
	const lines = output.split(/\r?\n/);

	// 目标 IP：PING example.com (93.184.216.34)
	const ipMatch = output.match(/\(([\d.a-fA-F:]+)\)/);
	const ip = ipMatch ? ipMatch[1] : host;

	// 每次探测：Linux/macOS 的 icmp_seq=1 ttl=57 time=1.23 ms，Windows 的 time=1ms TTL=57（中文为「时间=1ms」）
	const attempts: PingAttempt[] = [];
	let index = 0;
	for (const line of lines) {
		const latency = line.match(/(?:time|时间)[=<]\s*([\d.]+)\s*ms/i);
		if (latency) {
			index += 1;
			attempts.push({ index, status: 'ok', latencyMs: Number(latency[1]) });
		}
	}

	// 汇总行：Linux / macOS（packets transmitted / received）
	const unixSummary = output.match(/(\d+)\s+packets transmitted,\s*(\d+)\s*(?:packets\s*)?received/i);
	// 汇总行：Windows（英文 Sent = / Received =，中文 已发送 = / 已接收 =）
	const winSummary =
		output.match(/Sent\s*=\s*(\d+)[^\d]+Received\s*=\s*(\d+)/i) ??
		output.match(/已发送\s*=\s*(\d+)[^\d]+已接收\s*=\s*(\d+)/);

	let sent = Number(unixSummary?.[1] ?? winSummary?.[1] ?? count);
	let received = Number(unixSummary?.[2] ?? winSummary?.[2] ?? attempts.filter((a) => a.status === 'ok').length);

	// 各语言输出均无法解析时，退回退出码判断（ping 全部成功时退出码为 0）
	if (!unixSummary && !winSummary && exitCode === 0) {
		sent = count;
		received = count;
	}

	const rtt = output.match(/(?:rtt|round-trip)\s+min\/avg\/max\/(?:mdev|stddev)\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)/i);
	const winRtt = output.match(/Minimum\s*=\s*(\d+)ms[^\d]+Maximum\s*=\s*(\d+)ms[^\d]+Average\s*=\s*(\d+)ms/i);

	const min = rtt ? Number(rtt[1]) : winRtt ? Number(winRtt[1]) : null;
	const avg = rtt ? Number(rtt[2]) : winRtt ? Number(winRtt[3]) : null;
	const max = rtt ? Number(rtt[3]) : winRtt ? Number(winRtt[2]) : null;

	// 未解析出逐次结果时，按汇总结果补齐占位条目（延迟未知）
	if (!attempts.length && sent) {
		for (let i = 1; i <= sent; i++) {
			attempts.push({
				index: i,
				status: i <= received ? 'ok' : 'timeout',
				latencyMs: null,
				detail: i <= received ? undefined : '未收到应答'
			});
		}
	}

	return { ip, attempts, sent, received, min, avg, max };
}

/** 单次 TCP 端口探测：连接成功或收到 RST（端口未开放）都说明主机可达 */
function tcpProbe(ip: string, port: number, timeoutMs: number): Promise<PingAttempt> {
	return new Promise((resolve) => {
		const startedAt = Date.now();
		const socket = net.connect({ host: ip, port });
		let settled = false;

		const finish = (status: PingAttemptStatus, detail?: string) => {
			if (settled) return;
			settled = true;
			socket.destroy();
			resolve({
				index: 0,
				status,
				latencyMs: status === 'timeout' || status === 'error' ? null : Date.now() - startedAt,
				detail
			});
		};

		socket.setTimeout(timeoutMs);
		socket.on('connect', () => finish('ok'));
		socket.on('timeout', () => finish('timeout', '连接超时'));
		socket.on('error', (error: NodeJS.ErrnoException) => {
			if (error.code === 'ECONNREFUSED') finish('refused', '端口未开放（主机可达）');
			else if (error.code === 'EHOSTUNREACH' || error.code === 'ENETUNREACH') finish('error', '网络不可达');
			else finish('error', error.code ?? String(error));
		});
	});
}

/** 解析目标主机为 IP（主机名走系统 DNS，尊重 /etc/hosts） */
async function resolveHostIp(host: string): Promise<string> {
	if (net.isIP(host)) return host;
	const address = await lookup(host);
	return address.address;
}

/** 汇总探测结果（可达 = 连接成功或端口未开放） */
function summarize(attempts: PingAttempt[], sent: number): Omit<PingOutcome, 'host' | 'ip' | 'mode' | 'port'> {
	const reachable = attempts.filter((item) => item.status === 'ok' || item.status === 'refused');
	const latencies = reachable
		.map((item) => item.latencyMs)
		.filter((value): value is number => typeof value === 'number');
	return {
		sent,
		received: reachable.length,
		lossRate: sent ? Math.round(((sent - reachable.length) / sent) * 1000) / 10 : 0,
		min: latencies.length ? Math.min(...latencies) : null,
		avg: latencies.length
			? Math.round((latencies.reduce((sum, value) => sum + value, 0) / latencies.length) * 100) / 100
			: null,
		max: latencies.length ? Math.max(...latencies) : null,
		attempts
	};
}

/**
 * 主机可达性探测：
 * - icmp：调用系统 ping 命令（无 ping 命令时抛出可读错误，前端引导改用 TCP）
 * - tcp：对目标 IP + 端口做 TCP 连接探测，容器环境同样可用
 */
export async function pingTarget(params: PingPayload): Promise<PingOutcome> {
	const host = normalizePingHost(params.host);
	const mode: PingMode = params.mode === 'icmp' ? 'icmp' : 'tcp';
	const count = clampInt(params.count, 1, MAX_PING_COUNT, DEFAULT_PING_COUNT);
	const timeoutMs = clampInt(params.timeoutMs, 500, 10000, DEFAULT_PING_TIMEOUT_MS);
	const port = clampInt(params.port, 1, 65535, DEFAULT_TCP_PORT);

	if (mode === 'icmp') {
		if (!(await checkPingAvailable())) {
			throw new Error('部署服务器上未找到 ping 命令，无法执行 ICMP 探测，请改用 TCP 端口探测方式');
		}
		const ip = await resolveHostIp(host);
		const { output, exitCode } = await runIcmpPing(host, count, timeoutMs);
		const parsed = parseIcmpOutput(host, count, output, exitCode);
		const latencies = parsed.attempts
			.map((item) => item.latencyMs)
			.filter((value): value is number => typeof value === 'number');
		return {
			host,
			ip,
			mode,
			port: null,
			sent: parsed.sent,
			received: parsed.received,
			lossRate: parsed.sent ? Math.round(((parsed.sent - parsed.received) / parsed.sent) * 1000) / 10 : 0,
			min: parsed.min ?? (latencies.length ? Math.min(...latencies) : null),
			avg:
				parsed.avg ??
				(latencies.length
					? Math.round((latencies.reduce((sum, value) => sum + value, 0) / latencies.length) * 100) / 100
					: null),
			max: parsed.max ?? (latencies.length ? Math.max(...latencies) : null),
			attempts: parsed.attempts,
			raw: output.trim().split(/\r?\n/).slice(-12).join('\n')
		};
	}

	const ip = await resolveHostIp(host);
	const attempts: PingAttempt[] = [];
	for (let i = 1; i <= count; i++) {
		const attempt = await tcpProbe(ip, port, timeoutMs);
		attempts.push({ ...attempt, index: i });
	}
	return { host, ip, mode, port, ...summarize(attempts, count) };
}

/** GET /api/dns/servers 处理器 */
export async function handleDnsServers(): Promise<DnsHandlerResult> {
	try {
		const status = await getDnsServerStatus();
		return { status: 200, body: { ok: true, ...status } };
	} catch (error) {
		const { message } = describeError(error);
		return { status: 500, body: { ok: false, error: message } };
	}
}

/** POST /api/dns/resolve 处理器 */
export async function handleDnsResolve(payload: unknown): Promise<DnsHandlerResult> {
	try {
		const params = (payload ?? {}) as Partial<DnsResolvePayload>;
		const result = await resolveDns({
			name: String(params.name ?? ''),
			type: String(params.type ?? ''),
			server: params.server ? String(params.server) : ''
		});
		return { status: 200, body: { ok: true, result } };
	} catch (error) {
		const { code, message } = describeError(error);
		return { status: 400, body: { ok: false, error: message, code } };
	}
}

/** POST /api/dns/ping 处理器 */
export async function handleDnsPing(payload: unknown): Promise<DnsHandlerResult> {
	try {
		const params = (payload ?? {}) as Partial<PingPayload>;
		const result = await pingTarget({
			host: String(params.host ?? ''),
			mode: params.mode,
			port: params.port,
			count: params.count,
			timeoutMs: params.timeoutMs
		});
		return { status: 200, body: { ok: true, result } };
	} catch (error) {
		const { code, message } = describeError(error);
		return { status: 400, body: { ok: false, error: message, code } };
	}
}
