// IP 网络工具静态函数（IPv4 解析 / IPv6 解析 / 子网计算）
// 全部为纯函数，供各网络工具 view 调用

import type {
	Ipv4ParseResult,
	Ipv4SubnetCalcResult,
	Ipv6ParseResult,
	Ipv6SubnetCalcResult,
	SubnetCalcResult,
	SubnetEntry
} from '@/types/ip';

// ==================== IPv4 相关 ====================

/** 解析带可选 CIDR 前缀的 IPv4 输入，返回点分十进制地址与前缀长度（无前缀默认 /32） */
export function parseIpv4Input(input: string): { ip: string; prefix: number } | null {
	const trimmed = input.trim();
	const parts = trimmed.split('/');
	if (parts.length > 2) return null;
	const ipPart = parts[0];
	const prefixPart = parts.length === 2 ? parts[1] : '';
	const int = ipv4ToInt(ipPart);
	if (int === null) return null;
	let prefix = 32;
	if (prefixPart !== '') {
		if (!/^\d{1,2}$/.test(prefixPart)) return null;
		const p = parseInt(prefixPart, 10);
		if (p < 0 || p > 32) return null;
		prefix = p;
	}
	return { ip: intToIpv4(int), prefix };
}

/** IPv4 点分十进制转 32 位无符号整数，非法返回 null */
export function ipv4ToInt(ip: string): number | null {
	const parts = ip.trim().split('.');
	if (parts.length !== 4) return null;
	let result = 0;
	for (const part of parts) {
		if (!/^\d{1,3}$/.test(part)) return null;
		const n = parseInt(part, 10);
		if (n > 255) return null;
		result = result * 256 + n;
	}
	return result;
}

/** 32 位无符号整数转 IPv4 点分十进制 */
export function intToIpv4(int: number): string {
	const n = int >>> 0;
	return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

/** 前缀长度转子网掩码整数（如 24 → 0xffffff00） */
function maskToInt(prefix: number): number {
	if (prefix === 0) return 0;
	return ((2 ** prefix - 1) << (32 - prefix)) >>> 0;
}

/** 判断 IPv4 整数值落在哪个地址类别（A-E，基于首字节） */
function ipClassOf(int: number): string {
	const first = (int >>> 24) & 255;
	if (first <= 126) return 'A';
	if (first <= 191) return 'B';
	if (first <= 223) return 'C';
	if (first <= 239) return 'D';
	return 'E';
}

/** IPv4 私有地址范围表 */
const IPV4_PRIVATE_RANGES: Array<[number, number]> = [
	[ipv4ToInt('10.0.0.0')!, ipv4ToInt('10.255.255.255')!],
	[ipv4ToInt('172.16.0.0')!, ipv4ToInt('172.31.255.255')!],
	[ipv4ToInt('192.168.0.0')!, ipv4ToInt('192.168.255.255')!]
];

/** IPv4 保留地址范围表（RFC 5735 / 6890 主要条目） */
const IPV4_RESERVED_RANGES: Array<[number, number]> = [
	[ipv4ToInt('0.0.0.0')!, ipv4ToInt('0.255.255.255')!],
	[ipv4ToInt('100.64.0.0')!, ipv4ToInt('100.127.255.255')!],
	[ipv4ToInt('127.0.0.0')!, ipv4ToInt('127.255.255.255')!],
	[ipv4ToInt('169.254.0.0')!, ipv4ToInt('169.254.255.255')!],
	[ipv4ToInt('192.0.0.0')!, ipv4ToInt('192.0.0.255')!],
	[ipv4ToInt('192.0.2.0')!, ipv4ToInt('192.0.2.255')!],
	[ipv4ToInt('198.18.0.0')!, ipv4ToInt('198.19.255.255')!],
	[ipv4ToInt('198.51.100.0')!, ipv4ToInt('198.51.100.255')!],
	[ipv4ToInt('203.0.113.0')!, ipv4ToInt('203.0.113.255')!],
	[ipv4ToInt('224.0.0.0')!, ipv4ToInt('239.255.255.255')!],
	[ipv4ToInt('240.0.0.0')!, ipv4ToInt('255.255.255.255')!]
];

/** 判断整数是否落在任一区间内 */
function inRanges(int: number, ranges: Array<[number, number]>): boolean {
	return ranges.some(([start, end]) => int >= start && int <= end);
}

/** 可用主机数文本：/31 与 /32 特殊说明 */
function usableHostsText(prefix: number, total: number): string {
	if (prefix === 31) return '2（P2P 链路）';
	if (prefix === 32) return '1（本机）';
	return String(Math.max(0, total - 2));
}

/** 完整解析一个 IPv4 地址（可带 CIDR 前缀） */
export function analyzeIpv4(input: string): Ipv4ParseResult | null {
	const parsed = parseIpv4Input(input);
	if (!parsed) return null;
	const { ip, prefix } = parsed;
	const ipInt = ipv4ToInt(ip)!;
	const maskInt = maskToInt(prefix);
	const hostBits = 32 - prefix;
	const networkInt = Math.floor(ipInt / 2 ** hostBits) * 2 ** hostBits;
	const broadcastInt = networkInt + 2 ** hostBits - 1;
	const total = 2 ** hostBits;

	return {
		ip,
		prefix,
		mask: intToIpv4(maskInt),
		maskBinary: maskInt.toString(2).padStart(32, '0'),
		network: intToIpv4(networkInt),
		broadcast: intToIpv4(broadcastInt),
		firstHost: prefix >= 31 ? intToIpv4(networkInt) : intToIpv4(networkInt + 1),
		lastHost: prefix >= 31 ? intToIpv4(broadcastInt) : intToIpv4(broadcastInt - 1),
		totalHosts: String(total),
		usableHosts: usableHostsText(prefix, total),
		wildcard: intToIpv4(~maskInt),
		binary: ipInt.toString(2).padStart(32, '0'),
		hex: ipInt.toString(16).padStart(8, '0'),
		int: String(ipInt),
		reverse: `${[ipInt & 255, (ipInt >>> 8) & 255, (ipInt >>> 16) & 255, (ipInt >>> 24) & 255].join('.')}.in-addr.arpa`,
		ipClass: ipClassOf(ipInt),
		isPrivate: inRanges(ipInt, IPV4_PRIVATE_RANGES),
		isLoopback: ipInt >= ipv4ToInt('127.0.0.0')! && ipInt <= ipv4ToInt('127.255.255.255')!,
		isMulticast: ipInt >= ipv4ToInt('224.0.0.0')! && ipInt <= ipv4ToInt('239.255.255.255')!,
		isLinkLocal: ipInt >= ipv4ToInt('169.254.0.0')! && ipInt <= ipv4ToInt('169.254.255.255')!,
		isReserved: inRanges(ipInt, IPV4_RESERVED_RANGES)
	};
}

// ==================== IPv6 相关 ====================

/** 每组补足 4 位十六进制 */
function padGroup(g: string): string {
	return g.padStart(4, '0');
}

/** IPv4 点分十进制转 2 组十六进制（如 192.168.1.1 → c0a8:0101） */
function ipv4ToHexPair(ipv4: string): string {
	const int = ipv4ToInt(ipv4);
	if (int === null) return '';
	const high = (int >>> 16) & 0xffff;
	const low = int & 0xffff;
	return `${padGroup(high.toString(16))}:${padGroup(low.toString(16))}`;
}

/**
 * 将 IPv6 地址展开为 8 组四位十六进制。
 * 支持 :: 压缩、内嵌 IPv4 形式（如 ::ffff:192.168.1.1）。
 * 返回 null 表示非法。
 */
export function expandIpv6ToGroups(input: string): { groups: string[]; ipv4Embedded: string | null } | null {
	let core = input.trim();
	if (!core) return null;
	let ipv4Embedded: string | null = null;

	// 检测内嵌 IPv4（仅允许出现在最后一组）
	const lastColon = core.lastIndexOf(':');
	const lastPart = core.slice(lastColon + 1);
	if (lastPart.includes('.')) {
		const hexPair = ipv4ToHexPair(lastPart);
		if (!hexPair) return null;
		ipv4Embedded = lastPart;
		core = core.slice(0, lastColon + 1) + hexPair;
	}

	// 处理 ::
	const dbl = core.split('::');
	if (dbl.length > 2) return null;
	if (dbl.length === 2) {
		const left = dbl[0] ? dbl[0].split(':').filter(Boolean) : [];
		const right = dbl[1] ? dbl[1].split(':').filter(Boolean) : [];
		const missing = 8 - left.length - right.length;
		if (missing < 0) return null;
		const groups = [...left, ...Array(missing).fill('0'), ...right];
		if (groups.length !== 8 || groups.some((g) => !/^[0-9a-fA-F]{1,4}$/.test(g))) return null;
		return { groups: groups.map(padGroup), ipv4Embedded };
	}

	const groups = core.split(':');
	if (groups.length !== 8 || groups.some((g) => !/^[0-9a-fA-F]{1,4}$/.test(g))) return null;
	return { groups: groups.map(padGroup), ipv4Embedded };
}

/** 展开为完整 32 位十六进制字符串（小写） */
export function expandIpv6(input: string): string | null {
	const r = expandIpv6ToGroups(input);
	if (!r) return null;
	return r.groups.join('').toLowerCase();
}

/** 标准压缩：将最长连续全零组（≥2 组）压缩为 ::（并列取最靠前） */
export function compressIpv6(groups: string[]): string {
	// 找出最长连续 '0000' 运行
	let bestStart = -1;
	let bestLen = 0;
	let curStart = -1;
	let curLen = 0;
	for (let i = 0; i < groups.length; i++) {
		if (groups[i] === '0000') {
			if (curStart === -1) curStart = i;
			curLen++;
			if (curLen > bestLen) {
				bestStart = curStart;
				bestLen = curLen;
			}
		} else {
			curStart = -1;
			curLen = 0;
		}
	}
	if (bestLen < 2) {
		return groups.map((g) => g.replace(/^0+(?=[0-9a-f])/, '')).join(':');
	}
	const left = groups.slice(0, bestStart).map((g) => g.replace(/^0+(?=[0-9a-f])/, ''));
	const right = groups.slice(bestStart + bestLen).map((g) => g.replace(/^0+(?=[0-9a-f])/, ''));
	return `${left.join(':')}::${right.join(':')}`;
}

/** 对 32 位十六进制字符串按前缀长度清零低位（用于计算网络地址） */
export function applyIpv6Prefix(hex: string, prefix: number): string {
	if (prefix >= 128) return hex;
	const bits = hex
		.split('')
		.map((c) => parseInt(c, 16).toString(2).padStart(4, '0'))
		.join('');
	const masked = bits.slice(0, prefix) + '0'.repeat(128 - prefix);
	let out = '';
	for (let i = 0; i < 32; i++) {
		out += parseInt(masked.slice(i * 4, i * 4 + 4), 2).toString(16);
	}
	return out;
}

/** 前缀长度转 IPv6 掩码（展开十六进制，prefix 位为 1） */
export function ipv6MaskHex(prefix: number): string {
	const ones = '1'.repeat(prefix) + '0'.repeat(128 - prefix);
	let out = '';
	for (let i = 0; i < 32; i++) {
		out += parseInt(ones.slice(i * 4, i * 4 + 4), 2).toString(16);
	}
	return out;
}

/** 完整解析一个 IPv6 地址（可带 CIDR 前缀） */
export function analyzeIpv6(input: string): Ipv6ParseResult | null {
	const trimmed = input.trim();
	const parts = trimmed.split('/');
	if (parts.length > 2) return null;
	const ipPart = parts[0];
	const prefixPart = parts.length === 2 ? parts[1] : '';
	const expanded = expandIpv6(ipPart);
	if (!expanded) return null;
	let prefix = 128;
	if (prefixPart !== '') {
		if (!/^\d{1,3}$/.test(prefixPart)) return null;
		const p = parseInt(prefixPart, 10);
		if (p < 0 || p > 128) return null;
		prefix = p;
	}

	const { groups, ipv4Embedded } = expandIpv6ToGroups(ipPart)!;
	const networkHex = applyIpv6Prefix(expanded, prefix);
	const networkGroups = networkHex.match(/.{4}/g) ?? [];
	const maskHex = ipv6MaskHex(prefix);
	const maskGroups = maskHex.match(/.{4}/g) ?? [];
	// 接口标识符为低 64 位（最后 16 个十六进制字符）
	const interfaceId = expanded.slice(16, 32);
	const hex = expanded;
	// 反向 DNS（nibble 格式，从末位字符逐级）
	const reverse = hex.split('').reverse().join('.') + '.ip6.arpa';
	// 首字节（前 8 位）
	const firstByte = parseInt(hex.slice(0, 2), 16);
	const isUnspecified = hex === '0'.repeat(32);
	const isLoopback = hex === '0'.repeat(31) + '1';
	// fe80::/10 → 首字节高 7 位 1111111 且第 9-10 位为 10（0xfe80 掩码取前 10 位）
	const isLinkLocal = (parseInt(hex.slice(0, 4), 16) & 0xffc0) === 0xfe80;
	const isMulticast = hex.startsWith('ff');
	// fc00::/7 → 首字节高 7 位 1111110（0xfc 或 0xfd）
	const isUniqueLocal = (firstByte & 0xfe) === 0xfc;
	// ::ffff:a.b.c.d → 高 80 位全零 + ffff
	const isIpv4Mapped = hex.startsWith('0'.repeat(20) + 'ffff');
	const isDocumentation = hex.startsWith('20010db8');
	const isGlobalUnicast = !isUnspecified && !isLoopback && !isMulticast && !isLinkLocal && !isUniqueLocal;

	return {
		ip: compressIpv6(groups),
		prefix,
		expanded,
		compressed: compressIpv6(groups),
		network: compressIpv6(networkGroups),
		mask: maskGroups.join(':'),
		maskCompressed: compressIpv6(maskGroups),
		interfaceId,
		reverse,
		totalHosts: (2n ** BigInt(128 - prefix)).toString(),
		ipv4Mapped: isIpv4Mapped ? intToIpv4(parseInt(expanded.slice(24, 32), 16)) : ipv4Embedded,
		isUnspecified,
		isLoopback,
		isLinkLocal,
		isMulticast,
		isUniqueLocal,
		isGlobalUnicast,
		isIpv4Mapped,
		isDocumentation
	};
}

// ==================== 子网计算 ====================

/** 子网列表单次渲染最大条数（防止浏览器卡顿） */
const MAX_SUBNET_ROWS = 500;

/** 计算 IPv4 子网划分：将 CIDR 网络划分为 targetPrefix 前缀的若干子网 */
export function calcIpv4Subnets(input: string, targetPrefix: number): Ipv4SubnetCalcResult | null {
	const parsed = parseIpv4Input(input);
	if (!parsed) return null;
	const { ip, prefix } = parsed;
	if (targetPrefix < prefix || targetPrefix > 32) return null;
	const ipInt = ipv4ToInt(ip)!;
	const maskInt = maskToInt(prefix);
	const hostBits = 32 - prefix;
	const networkInt = Math.floor(ipInt / 2 ** hostBits) * 2 ** hostBits;
	const broadcastInt = networkInt + 2 ** hostBits - 1;
	const total = 2 ** hostBits;

	const subHostBits = 32 - targetPrefix;
	const step = 2 ** subHostBits;
	const subnetCount = 2 ** (targetPrefix - prefix);
	const truncated = subnetCount > MAX_SUBNET_ROWS;
	const displayCount = Math.min(subnetCount, MAX_SUBNET_ROWS);
	const subnets: SubnetEntry[] = [];
	for (let i = 0; i < displayCount; i++) {
		const n = networkInt + i * step;
		const b = n + step - 1;
		subnets.push({
			index: i,
			network: `${intToIpv4(n)}/${targetPrefix}`,
			range: `${intToIpv4(n)} - ${intToIpv4(b)}`,
			hosts: usableHostsText(targetPrefix, step),
			broadcast: intToIpv4(b)
		});
	}

	return {
		version: 4,
		ip,
		prefix,
		targetPrefix,
		mask: intToIpv4(maskInt),
		maskBinary: maskInt.toString(2).padStart(32, '0'),
		wildcard: intToIpv4(~maskInt),
		network: intToIpv4(networkInt),
		broadcast: intToIpv4(broadcastInt),
		firstHost: prefix >= 31 ? intToIpv4(networkInt) : intToIpv4(networkInt + 1),
		lastHost: prefix >= 31 ? intToIpv4(broadcastInt) : intToIpv4(broadcastInt - 1),
		totalHosts: String(total),
		usableHosts: usableHostsText(prefix, total),
		binary: networkInt.toString(2).padStart(32, '0'),
		reverse: `${[broadcastInt & 255, (broadcastInt >>> 8) & 255, (broadcastInt >>> 16) & 255, (broadcastInt >>> 24) & 255].join('.')}.in-addr.arpa`,
		subnetCount,
		truncated,
		subnets
	};
}

/** 计算 IPv6 子网划分：将 CIDR 网络划分为 targetPrefix 前缀的若干子网 */
export function calcIpv6Subnets(input: string, targetPrefix: number): Ipv6SubnetCalcResult | null {
	const trimmed = input.trim();
	const parts = trimmed.split('/');
	if (parts.length > 2) return null;
	const expanded = expandIpv6(parts[0]);
	if (!expanded) return null;
	let prefix = 128;
	if (parts.length === 2) {
		if (!/^\d{1,3}$/.test(parts[1])) return null;
		const p = parseInt(parts[1], 10);
		if (p < 0 || p > 128) return null;
		prefix = p;
	}
	if (targetPrefix < prefix || targetPrefix > 128) return null;
	const { groups } = expandIpv6ToGroups(parts[0])!;
	const networkHex = applyIpv6Prefix(expanded, prefix);
	const maskHex = ipv6MaskHex(prefix);

	// 每个子网的大小（地址数）与相邻子网步长
	const subBits = 128 - targetPrefix;
	const stepBig = targetPrefix >= 128 ? 1n : 2n ** BigInt(subBits);
	const perSubnet = 2n ** BigInt(subBits);
	const subnetCount = 2n ** BigInt(targetPrefix - prefix);
	const truncated = subnetCount > BigInt(MAX_SUBNET_ROWS);
	const displayCount = subnetCount < BigInt(MAX_SUBNET_ROWS) ? Number(subnetCount) : MAX_SUBNET_ROWS;
	const subnets: SubnetEntry[] = [];
	const networkBig = BigInt('0x' + networkHex);
	for (let i = 0; i < displayCount; i++) {
		const n = networkBig + stepBig * BigInt(i);
		const nHex = n.toString(16).padStart(32, '0');
		const lastHex = (n + stepBig - 1n).toString(16).padStart(32, '0');
		subnets.push({
			index: i,
			network: `${compressIpv6(nHex.match(/.{4}/g) ?? [])}/${targetPrefix}`,
			range: `${compressIpv6(nHex.match(/.{4}/g) ?? [])} - ${compressIpv6(lastHex.match(/.{4}/g) ?? [])}`,
			hosts: perSubnet.toString(),
			broadcast: null
		});
	}

	return {
		version: 6,
		ip: compressIpv6(groups),
		prefix,
		targetPrefix,
		expanded,
		compressed: compressIpv6(groups),
		network: (networkHex.match(/.{4}/g) ?? []).join(':'),
		mask: (maskHex.match(/.{4}/g) ?? []).join(':'),
		interfaceId: expanded.slice(64, 128),
		totalHosts: (2n ** BigInt(128 - prefix)).toString(),
		subnetCount: subnetCount.toString(),
		truncated,
		subnets
	};
}

/** 统一入口：根据输入自动识别 IPv4 / IPv6 并计算子网划分 */
export function calcSubnets(input: string, targetPrefix: number): SubnetCalcResult | null {
	if (input.includes('.')) return calcIpv4Subnets(input, targetPrefix);
	if (input.includes(':')) return calcIpv6Subnets(input, targetPrefix);
	return null;
}
