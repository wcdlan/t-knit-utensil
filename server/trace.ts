// 路由追踪（traceroute / tracert）的服务端逻辑
// 由 server/index.ts（生产 API）与 vite-plugin-config.ts（dev 中间件）共享。
// Node 无法自行收发 ICMP 超时报文（无法获知超时报文来源 IP），因此调用系统 traceroute / tracert 命令，
// 再把各平台（Linux / macOS / Windows）的输出统一解析为结构化跃点数据。

import { spawn } from 'node:child_process';
import net from 'node:net';
import { lookup, reverse } from 'node:dns/promises';
import { describeError } from './dns.ts';

/** 单次探测结果（一跳通常会连续探测多次） */
export interface TraceProbe {
	/** 该次探测的应答 IP（无响应为 null） */
	ip: string | null;
	/** 往返延迟（毫秒），无响应为 null */
	latencyMs: number | null;
}

/** 单个跃点（一跳） */
export interface TraceHop {
	/** 跳数（TTL，从 1 开始） */
	hop: number;
	/** 主应答 IP（首个有响应的探测），无响应为 null */
	ip: string | null;
	/** 该跳所有应答 IP（存在负载均衡时可能有多个） */
	ips: string[];
	/** PTR 反查得到的主机名 */
	hostname: string | null;
	/** 每次探测的详细结果 */
	probes: TraceProbe[];
	/** 跳状态：有响应 / 无响应 / 异常标注 */
	status: 'ok' | 'timeout' | 'error';
	/** 备注（不可达代码、其他应答 IP 等） */
	detail?: string;
	/** 是否为目标主机所在跳 */
	reached: boolean;
}

/** 路由追踪结果 */
export interface TraceOutcome {
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
	/** 原始输出（截取尾部若干行，便于排查解析差异） */
	raw: string;
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

/** 路由追踪请求载荷 */
export interface TracePayload {
	host: string;
	maxHops?: number;
	probes?: number;
	resolveNames?: boolean;
	timeoutMs?: number;
}

/** 接口统一返回结构 */
export interface TraceHandlerResult {
	status: number;
	body: unknown;
}

/** 默认最大跳数 */
const DEFAULT_MAX_HOPS = 20;

/** 最大跳数上限 */
const MAX_MAX_HOPS = 30;

/** 默认每跳探测次数 */
const DEFAULT_PROBES = 1;

/** 每跳探测次数上限 */
const MAX_PROBES = 3;

/** 单次探测默认超时（毫秒） */
const DEFAULT_PROBE_TIMEOUT_MS = 2000;

/** 单次追踪整体时间预算（超出即结束命令并返回已解析的部分结果） */
const TRACE_BUDGET_MS = 45000;

/** PTR 反查单条超时（毫秒） */
const REVERSE_TIMEOUT_MS = 2000;

/** 不可达标注（!X）对应的中文说明 */
const UNREACHABLE_LABELS: Record<string, string> = {
	'!H': '主机不可达',
	'!N': '网络不可达',
	'!P': '协议不可达',
	'!X': '通信被管理策略禁止',
	'!A': '与目标网络的通信被管理策略禁止',
	'!S': '源路由失败',
	'!F': '需要对数据包分片',
	'!U': '端口不可达'
};

/** 数值参数收敛到合法区间 */
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
	const num = Number(value);
	if (!Number.isFinite(num)) return fallback;
	return Math.min(Math.max(Math.round(num), min), max);
}

/** 校验并规范化目标（兼容粘贴 URL、带端口与 IPv6 方括号的写法） */
function normalizeTarget(input: string): string {
	let value = (input || '').trim();
	if (!value) throw new Error('请输入要追踪的目标主机名或 IP 地址');
	value = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
	value = value.split('/')[0].split('?')[0];
	if (value.startsWith('[')) {
		const end = value.indexOf(']');
		if (end > 0) value = value.slice(1, end);
	} else if (/:\d+$/.test(value) && value.split(':').length === 2) {
		value = value.replace(/:\d+$/, '');
	}
	if (!value) throw new Error('请输入要追踪的目标主机名或 IP 地址');
	return value;
}

/** 命令可用性描述：ipv6Flag 表示该命令需要通过 -6 参数显式指定 IPv6 */
interface TraceCommand {
	available: boolean;
	command: string | null;
	/** 是否需要在参数中追加 -6（Linux 的 traceroute 支持，macOS 只提供独立的 traceroute6） */
	ipv6Flag: boolean;
}

const traceBinaryCache = new Map<string, Promise<TraceCommand>>();

/** 探测命令是否存在（结果缓存；spawn 报 ENOENT 即不存在） */
function probeBinary(command: string): Promise<boolean> {
	return new Promise((resolve) => {
		const child = spawn(command, ['-h'], { stdio: 'ignore' });
		child.on('error', () => resolve(false));
		child.on('close', () => resolve(true));
	});
}

/**
 * 检测系统可用的路由追踪命令：
 * - Windows 统一使用 tracert，通过 -4 / -6 指定地址族
 * - IPv4 使用 traceroute
 * - IPv6 优先使用独立的 traceroute6（macOS / BSD 必须），否则退回 traceroute -6（Linux）
 */
export function checkTraceAvailable(family: 4 | 6 = 4): Promise<TraceCommand> {
	const cacheKey = `${process.platform}-${family}`;
	const cached = traceBinaryCache.get(cacheKey);
	if (cached) return cached;

	const task = (async (): Promise<TraceCommand> => {
		if (process.platform === 'win32') {
			const exists = await probeBinary('tracert');
			return { available: exists, command: exists ? 'tracert' : null, ipv6Flag: false };
		}
		if (family === 6) {
			if (await probeBinary('traceroute6')) return { available: true, command: 'traceroute6', ipv6Flag: false };
			if (await probeBinary('traceroute')) return { available: true, command: 'traceroute', ipv6Flag: true };
			return { available: false, command: null, ipv6Flag: false };
		}
		const exists = await probeBinary('traceroute');
		return { available: exists, command: exists ? 'traceroute' : null, ipv6Flag: false };
	})();

	traceBinaryCache.set(cacheKey, task);
	return task;
}

/** 服务端路由追踪能力状态 */
export async function getTraceStatus(): Promise<TraceStatus> {
	const { available, command } = await checkTraceAvailable(4);
	return { available, command, platform: process.platform };
}

/** 按平台与地址族构造命令参数（macOS / Linux 的 -w 为秒，Windows 的 -w 为毫秒） */
function buildArgs(
	host: string,
	family: 4 | 6,
	maxHops: number,
	probes: number,
	timeoutMs: number,
	ipv6Flag: boolean
): string[] {
	if (process.platform === 'win32') {
		return ['-d', family === 6 ? '-6' : '-4', '-h', String(maxHops), '-w', String(timeoutMs), host];
	}
	return [
		'-n',
		family === 6 && ipv6Flag ? '-6' : '',
		'-q',
		String(probes),
		'-w',
		String(Math.max(1, Math.round(timeoutMs / 1000))),
		'-m',
		String(maxHops),
		host
	].filter(Boolean);
}

/** 解析目标地址与地址族（IPv6 字面量直接判定，主机名走系统解析） */
async function resolveTarget(host: string): Promise<{ ip: string; family: 4 | 6 }> {
	const literal = net.isIP(host);
	if (literal) return { ip: host, family: literal === 6 ? 6 : 4 };
	try {
		const address = await lookup(host);
		return { ip: address.address, family: address.family === 6 ? 6 : 4 };
	} catch {
		return { ip: host, family: 4 };
	}
}

/** 执行系统命令并收集输出（超出时间预算时强制结束并标记） */
function runTraceCommand(
	command: string,
	args: string[]
): Promise<{ output: string; truncated: boolean; failed: boolean }> {
	return new Promise((resolve) => {
		const child = spawn(command, args);
		let output = '';
		let truncated = false;
		const collect = (chunk: unknown) => (output += String(chunk));
		child.stdout?.on('data', collect);
		child.stderr?.on('data', collect);

		const timer = setTimeout(() => {
			truncated = true;
			child.kill('SIGKILL');
		}, TRACE_BUDGET_MS);

		child.on('error', () => {
			clearTimeout(timer);
			resolve({ output, truncated, failed: true });
		});
		child.on('close', () => {
			clearTimeout(timer);
			resolve({ output, truncated, failed: false });
		});
	});
}

/** 解析单行中的探测序列（按出现顺序区分延迟、星号与应答 IP） */
type TraceItem = 'star' | { latency: number } | { ip: string };

function parseItems(text: string): TraceItem[] {
	const items: TraceItem[] = [];
	// 注意候选顺序：IPv4 必须排在 IPv6 之前，否则 IPv6 候选会吃掉 IPv4 的数字串；
	// IPv6 候选用先行断言要求至少两个冒号，避免把纯数字串误判为 IPv6
	const pattern =
		/(?<latency>[\d.]+)\s*ms|(?<star>\*)|(?<ipv4>\d{1,3}(?:\.\d{1,3}){3})|(?<ipv6>(?=[0-9a-fA-F:]*:[0-9a-fA-F:]*:)[0-9a-fA-F:]+)/g;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(text)) !== null) {
		const groups = match.groups ?? {};
		if (groups.latency !== undefined) items.push({ latency: Number(groups.latency) });
		else if (groups.star !== undefined) items.push('star');
		else if (groups.ipv4 !== undefined) items.push({ ip: groups.ipv4 });
		else if (groups.ipv6 !== undefined && net.isIPv6(groups.ipv6)) items.push({ ip: groups.ipv6 });
	}
	return items;
}

/**
 * 解析 traceroute / tracert 输出。
 * - Linux / macOS：每跳一行，`IP 延迟` 成对出现，多 IP 应答会产生缩进的续行（需要合并到上一跳）
 * - Windows：每跳一行，形如 `1 ms 1 ms 1 ms 192.168.1.1`，延迟在前、应答 IP 在末尾
 * - 无响应统一以 `*` 占位
 */
export function parseTraceOutput(output: string): TraceHop[] {
	// 先按跳合并文本：Linux / macOS 在多 IP 应答时会输出缩进的续行，需要并到上一跳再统一解析
	const groups: { hop: number; text: string }[] = [];
	for (const line of output.split(/\r?\n/)) {
		const hopMatch = line.match(/^\s*(\d+)\s+(.*)$/);
		if (hopMatch) {
			groups.push({ hop: Number(hopMatch[1]), text: hopMatch[2] });
			continue;
		}
		if (/^\s+\S/.test(line) && groups.length) {
			groups[groups.length - 1].text += ` ${line.trim()}`;
		}
	}

	return groups.map(({ hop, text }) => {
		const probes = buildProbes(text);
		const ips = uniqueIps(probes);
		const labels = extractLabels(text);
		const details: string[] = [];
		if (ips.length > 1) details.push(`多个应答：${ips.join('、')}`);
		if (labels.length) details.push(labels.join('、'));
		return {
			hop,
			ip: ips[0] ?? null,
			ips,
			hostname: null,
			probes,
			status: ips.length ? 'ok' : labels.length ? 'error' : 'timeout',
			detail: details.length ? details.join('；') : undefined,
			reached: false
		};
	});
}

/** 把一行（或合并后的多行）文本转换为探测序列 */
function buildProbes(text: string): TraceProbe[] {
	const items = parseItems(text);
	// Windows 样式：最后一个条目是应答 IP（延迟全部出现在 IP 之前）
	const last = items[items.length - 1];
	const trailingIp = last && typeof last === 'object' && 'ip' in last ? last.ip : null;

	const probes: TraceProbe[] = [];
	let pendingIp: string | null = null;
	for (const item of items) {
		if (typeof item === 'object' && 'ip' in item) {
			pendingIp = item.ip;
			continue;
		}
		if (item === 'star') {
			probes.push({ ip: null, latencyMs: null });
			continue;
		}
		// 同一跳内同一 IP 连续探测时沿用上一个应答 IP
		probes.push({ ip: pendingIp ?? trailingIp, latencyMs: item.latency });
	}
	return probes;
}

/** 提取探测序列中出现过的应答 IP（去重，保持顺序） */
function uniqueIps(probes: TraceProbe[]): string[] {
	const ips: string[] = [];
	for (const probe of probes) {
		if (probe.ip && !ips.includes(probe.ip)) ips.push(probe.ip);
	}
	return ips;
}

/** 提取不可达标注（如 !H、!N）并转为中文说明 */
function extractLabels(text: string): string[] {
	const labels: string[] = [];
	for (const match of text.matchAll(/![A-Z]/g)) {
		labels.push(UNREACHABLE_LABELS[match[0]] ?? `异常标注 ${match[0]}`);
	}
	return labels;
}

/** 从输出头部提取目标 IP（Windows 用 []，其余平台用 ()） */
function extractTargetIp(output: string): string {
	const unix = output.match(/traceroute to \S+ \(([\d.a-fA-F:]+)\)/);
	if (unix) return unix[1];
	const windows = output.match(/Tracing route to \S+ \[([\d.a-fA-F:]+)\]/i);
	if (windows) return windows[1];
	return '';
}

/** 为各跳应答 IP 反查 PTR 主机名（并行执行，单条超时即跳过） */
async function attachHostnames(hops: TraceHop[]): Promise<void> {
	const ips = [...new Set(hops.flatMap((hop) => hop.ips))];
	const names = new Map<string, string>();
	await Promise.all(
		ips.map(async (ip) => {
			try {
				const result = await Promise.race([
					reverse(ip),
					new Promise<string[]>((resolve) => setTimeout(() => resolve([]), REVERSE_TIMEOUT_MS))
				]);
				if (result.length) names.set(ip, result[0]);
			} catch {
				// 无 PTR 记录属正常情况，忽略
			}
		})
	);
	for (const hop of hops) {
		if (hop.ip && names.has(hop.ip)) hop.hostname = names.get(hop.ip) ?? null;
	}
}

/** 命令失败时给出可读原因 */
function describeTraceFailure(output: string): string {
	const text = output.trim();
	if (/unknown host|cannot resolve|Name or service not known|Temporary failure in name resolution/i.test(text)) {
		return '无法解析该主机名，请检查域名拼写或 DNS 配置';
	}
	if (/Operation not permitted|permission denied|socket: Permission denied/i.test(text)) {
		return '部署服务器没有执行 traceroute 的权限（需要 NET_RAW / root 权限），请为容器添加 NET_RAW 能力或改用其他方式测试路由';
	}
	if (/Network is unreachable/i.test(text)) {
		return '网络不可达：部署服务器没有到目标网络的路由';
	}
	if (/No route to host/i.test(text)) {
		return '无法连接到目标网络（No route to host）：部署服务器可能没有 IPv6 出口或到目标网络的路由';
	}
	const firstLine = text.split(/\r?\n/).find((line) => line.trim());
	return firstLine ? `路由追踪失败：${firstLine.trim()}` : '路由追踪未返回任何跃点，请检查目标地址与网络连通性';
}

/** 原始输出只保留尾部若干行，避免响应体过大 */
function trimRaw(output: string): string {
	return output.trim().split(/\r?\n/).slice(-30).join('\n');
}

/**
 * 执行路由追踪：调用系统 traceroute / tracert 逐跳探测，
 * 解析为结构化跃点并按需反查各跳主机名。
 */
export async function traceRoute(params: TracePayload): Promise<TraceOutcome> {
	const host = normalizeTarget(params.host);
	const maxHops = clampInt(params.maxHops, 1, MAX_MAX_HOPS, DEFAULT_MAX_HOPS);
	const probes = clampInt(params.probes, 1, MAX_PROBES, DEFAULT_PROBES);
	const timeoutMs = clampInt(params.timeoutMs, 500, 5000, DEFAULT_PROBE_TIMEOUT_MS);
	const resolveNames = params.resolveNames !== false;

	const target = await resolveTarget(host);
	const { available, command, ipv6Flag } = await checkTraceAvailable(target.family);
	if (!available || !command) {
		throw new Error(
			target.family === 6
				? '部署服务器上未找到可用的 IPv6 路由追踪命令（traceroute6 / traceroute -6），无法对 IPv6 目标执行路由追踪'
				: '部署服务器上未找到 traceroute / tracert 命令，无法执行路由追踪，请先安装 traceroute'
		);
	}

	const args = buildArgs(host, target.family, maxHops, probes, timeoutMs, ipv6Flag);
	const startedAt = Date.now();
	const { output, truncated, failed } = await runTraceCommand(command, args);
	if (failed) throw new Error(`无法执行 ${command} 命令`);

	const hops = parseTraceOutput(output);
	if (!hops.length) throw new Error(describeTraceFailure(output));

	const targetIp =
		extractTargetIp(output) ||
		(net.isIP(host)
			? host
			: await lookup(host)
					.then((r) => r.address)
					.catch(() => ''));
	if (targetIp) {
		for (const hop of hops) {
			if (hop.ips.includes(targetIp)) hop.reached = true;
		}
	}
	if (resolveNames) await attachHostnames(hops);

	return {
		host,
		ip: targetIp || host,
		family: target.family,
		maxHops,
		probes,
		reached: hops.some((hop) => hop.reached),
		truncated,
		hops,
		durationMs: Date.now() - startedAt,
		command: [command, ...args].join(' '),
		raw: trimRaw(output)
	};
}

/** GET /api/net/trace/check 处理器 */
export async function handleTraceCheck(): Promise<TraceHandlerResult> {
	try {
		const status = await getTraceStatus();
		return { status: 200, body: { ok: true, ...status } };
	} catch (error) {
		const { message } = describeError(error);
		return { status: 500, body: { ok: false, error: message } };
	}
}

/** POST /api/net/trace 处理器 */
export async function handleTraceRun(payload: unknown): Promise<TraceHandlerResult> {
	try {
		const params = (payload ?? {}) as Partial<TracePayload>;
		const result = await traceRoute({
			host: String(params.host ?? ''),
			maxHops: params.maxHops,
			probes: params.probes,
			resolveNames: params.resolveNames,
			timeoutMs: params.timeoutMs
		});
		return { status: 200, body: { ok: true, result } };
	} catch (error) {
		const { code, message } = describeError(error);
		return { status: 400, body: { ok: false, error: message, code } };
	}
}
