import os from 'node:os';

/**
 * 部署机器信息：由 server/index.ts（生产）与 vite-plugin-config.ts（dev 中间件）共享。
 * 返回系统级信息，供系统配置页「系统信息」展示。
 */
export interface SystemInfo {
	hostname: string;
	platform: string;
	osType: string;
	osRelease: string;
	arch: string;
	cpuModel: string;
	cpuCores: number;
	totalMemoryMB: number;
	freeMemoryMB: number;
	nodeVersion: string;
	processUptimeSec: number;
	systemUptimeSec: number;
	pid: number;
	timezone: string;
}

export function getSystemInfo(): SystemInfo {
	const cpus = os.cpus();
	return {
		hostname: os.hostname(),
		platform: os.platform(),
		osType: os.type(),
		osRelease: os.release(),
		arch: os.arch(),
		cpuModel: cpus[0]?.model?.trim() || '',
		cpuCores: cpus.length,
		totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
		freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
		nodeVersion: process.version,
		processUptimeSec: Math.round(process.uptime()),
		systemUptimeSec: Math.round(os.uptime()),
		pid: process.pid,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};
}
