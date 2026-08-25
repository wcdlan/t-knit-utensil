/** 部署机器信息（来自服务端 /api/system/info） */
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

/** /api/system/info 响应 */
export interface SystemInfoResponse {
	ok: boolean;
	info?: SystemInfo;
	error?: string;
}

/** ssh-keygen / OpenSSH 可用性状态（来自 /api/ssh-keygen/check） */
export interface SshKeygenStatus {
	available: boolean;
	version?: string;
	error?: string;
}
