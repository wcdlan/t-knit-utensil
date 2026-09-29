// 端口工具静态函数（随机端口生成 / 端口区间判定 / 常用服务端口检索）
// 全部为纯函数，供随机端口生成工具 view 调用

import { COMMON_PORT_GROUPS, COMMON_PORT_INDEX } from '@/data/ports';
import type {
	CommonPortEntry,
	CommonPortGroup,
	RandomPortEntry,
	RandomPortOptions,
	RandomPortResult
} from '@/types/port';

/** 端口号合法下限 */
export const PORT_MIN = 1;

/** 端口号合法上限 */
export const PORT_MAX = 65535;

/** 系统端口（知名端口）上限 */
const SYSTEM_PORT_MAX = 1023;

/** 注册端口上限（超过即动态 / 私有端口） */
const REGISTERED_PORT_MAX = 49151;

/** 端口区间是否合法（两者均在 1-65535 内且起始不大于结束） */
export function isPortRangeValid(min: number, max: number): boolean {
	return Number.isInteger(min) && Number.isInteger(max) && min >= PORT_MIN && max <= PORT_MAX && min <= max;
}

/** 判定端口所属区间名称（系统端口 / 注册端口 / 动态端口） */
export function describePortRange(port: number): string {
	if (port <= SYSTEM_PORT_MAX) return '系统端口';
	if (port <= REGISTERED_PORT_MAX) return '注册端口';
	return '动态端口';
}

/** 把端口写入合法区间（1-65535） */
export function clampPort(port: number): number {
	if (!Number.isFinite(port)) return PORT_MIN;
	return Math.min(Math.max(Math.round(port), PORT_MIN), PORT_MAX);
}

/** 查询端口对应的常用服务（同一端口可能命中多个服务） */
export function lookupCommonPorts(port: number): CommonPortEntry[] {
	return COMMON_PORT_INDEX.get(port) ?? [];
}

/** 汇总端口命中的常用服务名，如「Apache Tomcat、Traefik Dashboard」；未命中返回 null */
export function describePortMatch(port: number): string | null {
	const services = lookupCommonPorts(port);
	if (!services.length) return null;
	const names = services.slice(0, 2).map((entry) => entry.service);
	return services.length > 2 ? `${names.join('、')} 等 ${services.length} 个服务` : names.join('、');
}

/** 生成 [0, max) 区间的随机整数（crypto 真随机 + 拒绝采样，避免取模带来的分布偏差） */
function randomInt(max: number): number {
	if (max <= 1) return 0;
	const limit = Math.floor(0x100000000 / max) * max;
	const buffer = new Uint32Array(1);
	let value = 0;
	do {
		crypto.getRandomValues(buffer);
		value = buffer[0];
	} while (value >= limit);
	return value % max;
}

/** 生成随机且互不重复的端口号 */
export function generateRandomPorts(options: RandomPortOptions): RandomPortResult {
	const start = clampPort(Math.min(options.min, options.max));
	const end = clampPort(Math.max(options.min, options.max));

	// 构建候选端口池：按需剔除系统端口与常用服务端口
	const pool: number[] = [];
	for (let port = start; port <= end; port++) {
		if (options.excludeSystem && port <= SYSTEM_PORT_MAX) continue;
		if (options.excludeCommon && COMMON_PORT_INDEX.has(port)) continue;
		pool.push(port);
	}

	const requested = Math.max(1, Math.floor(options.count) || 1);
	const take = Math.min(requested, pool.length);
	const entries: RandomPortEntry[] = [];

	// 部分 Fisher-Yates 洗牌：只打乱前 take 个位置，避免整池排序
	for (let i = 0; i < take; i++) {
		const j = i + randomInt(pool.length - i);
		const swap = pool[i];
		pool[i] = pool[j];
		pool[j] = swap;
		const port = pool[i];
		entries.push({ port, rangeName: describePortRange(port), service: describePortMatch(port) });
	}

	entries.sort((a, b) => a.port - b.port);

	return { entries, poolSize: pool.length, insufficient: pool.length < requested };
}

/** 按关键词过滤常用服务端口分组（服务名 / 中文名 / 端口号 / 介绍命中），空关键词返回全部 */
export function filterCommonPortGroups(keyword: string): CommonPortGroup[] {
	const query = keyword.trim().toLowerCase();
	if (!query) return COMMON_PORT_GROUPS;

	return COMMON_PORT_GROUPS.map((group) => ({
		...group,
		entries: group.entries.filter(
			(entry) =>
				entry.service.toLowerCase().includes(query) ||
				entry.name.toLowerCase().includes(query) ||
				String(entry.port).includes(query) ||
				entry.description.toLowerCase().includes(query) ||
				(entry.note ? entry.note.toLowerCase().includes(query) : false)
		)
	})).filter((group) => group.entries.length > 0);
}

/** 常用服务默认端口总数（用于面板统计展示） */
export function countCommonPorts(): number {
	return COMMON_PORT_GROUPS.reduce((total, group) => total + group.entries.length, 0);
}
