// 系统信息封装：机器信息与 ssh-keygen/OpenSSH 状态检测，供系统配置页「系统信息」使用。

import type { SshKeygenStatus, SystemInfo, SystemInfoResponse } from '@/types/system';

export type { SystemInfo, SshKeygenStatus } from '@/types/system';

/**
 * 获取部署机器信息（服务端 os 模块读取）。
 * 失败返回 null，由调用方展示加载失败占位。
 */
export async function fetchSystemInfo(): Promise<SystemInfo | null> {
	try {
		const res = await fetch('/api/system/info');
		const data = (await res.json()) as SystemInfoResponse;
		return data.ok && data.info ? data.info : null;
	} catch {
		return null;
	}
}

/**
 * 检测后端所在系统 ssh-keygen / OpenSSH 可用性。
 * 与 ssh-keygen 工具页共用同一后端端点，这里额外保留 error 用于展示不可用原因。
 */
export async function fetchSshKeygenStatus(): Promise<SshKeygenStatus> {
	try {
		const res = await fetch('/api/ssh-keygen/check');
		const data = (await res.json()) as { ok: boolean; available: boolean; version?: string; error?: string };
		return { available: !!data.available, version: data.version, error: data.error };
	} catch {
		return { available: false, error: '检测请求失败' };
	}
}

/** 将秒数格式化为「X 天 X 小时 X 分钟」 */
export function formatUptime(sec: number): string {
	if (sec < 60) return `${sec} 秒`;
	const d = Math.floor(sec / 86400);
	const h = Math.floor((sec % 86400) / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const parts: string[] = [];
	if (d) parts.push(`${d} 天`);
	if (h) parts.push(`${h} 小时`);
	if (m) parts.push(`${m} 分钟`);
	return parts.join(' ') || '不足 1 分钟';
}

/** 将 MB 格式化为 GB（保留 1 位小数） */
export function formatMemoryMB(mb: number): string {
	return (mb / 1024).toFixed(1) + ' GB';
}
