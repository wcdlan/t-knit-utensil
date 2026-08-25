import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as keygenModule from 'ssh-keygen-lite';

// ssh-keygen-lite 是 CJS：ESM 下 import namespace 的 .default 即 module.exports（可调用函数）
type KeygenOptions = {
	location: string;
	type: 'rsa' | 'ecdsa';
	size: string;
	comment: string;
	password: string;
	read: boolean;
	force: boolean;
	destroy: boolean;
	format: 'RFC4716' | 'PKCS8' | 'PEM';
};
type KeygenOut = { key: string; pubKey: string };
const keygen = keygenModule.default as unknown as (opts: KeygenOptions) => Promise<KeygenOut>;

interface KeyTypeSpec {
	type: 'rsa' | 'ecdsa';
	size: string;
}

/**
 * 白名单映射：前端 type 字符串 → 原生 ssh-keygen 参数。
 * 严禁直接将客户端 size 透传给 -b，防止 -b 2000 之类非法/意外行为。
 * 注意：ssh-keygen-lite 恒传 -b <size> 且默认 '2048'，ECDSA 若未指定 size 会生成失败，故此处必须显式给出。
 */
export const SSH_KEY_TYPE_SPECS: Record<string, KeyTypeSpec> = {
	'rsa-2048': { type: 'rsa', size: '2048' },
	'rsa-3072': { type: 'rsa', size: '3072' },
	'rsa-4096': { type: 'rsa', size: '4096' },
	'ecdsa-p256': { type: 'ecdsa', size: '256' },
	'ecdsa-p384': { type: 'ecdsa', size: '384' },
	'ecdsa-p521': { type: 'ecdsa', size: '521' }
};

export interface SshKeygenAvailability {
	available: boolean;
	version?: string;
	error?: string;
}

export interface SshKeygenGenerateRequest {
	type: string;
	comment?: string;
	passphrase?: string;
}

export interface SshKeygenGenerateResult {
	privateKey: string;
	publicKey: string;
}

export class SshKeygenError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

/**
 * 检测系统 ssh-keygen 是否可用，并尽力解析 OpenSSH 版本号。
 * 版本号取自 `ssh -V` 的 stderr（ssh-keygen 本身无 --version / -V，-V 是证书有效期选项）。
 */
export function getSshKeygenAvailability(): SshKeygenAvailability {
	const probe = spawnSync('ssh-keygen', ['test'], { encoding: 'utf8' });
	if (probe.error) {
		const err = probe.error as NodeJS.ErrnoException;
		return {
			available: false,
			error: err.code === 'ENOENT' ? '未安装 ssh-keygen（建议安装 openssh-client）' : String(probe.error.message)
		};
	}

	let version: string | undefined;
	const vs = spawnSync('ssh', ['-V'], { encoding: 'utf8' });
	const m = (vs.stderr || vs.stdout || '').match(/OpenSSH_([\d.]+[A-Za-z]*)/);
	if (m) version = m[1];

	return { available: true, version };
}

/**
 * 生成密钥对。临时路径每次唯一，并发安全；读回后销毁，finally 兜底清理。
 */
export async function generateSshKeyPair(req: SshKeygenGenerateRequest): Promise<SshKeygenGenerateResult> {
	const spec = SSH_KEY_TYPE_SPECS[req.type];
	if (!spec) {
		throw new SshKeygenError(400, `不支持的密钥类型: ${req.type}`);
	}

	const location = path.join(os.tmpdir(), `tku-sshkeygen-${randomUUID()}`);
	try {
		const out = await keygen({
			type: spec.type,
			size: spec.size,
			comment: req.comment ?? '',
			password: req.passphrase ?? '',
			location,
			read: true,
			force: true,
			destroy: true,
			format: 'RFC4716'
		});
		// 库会 trim 掉末尾换行，这里补回，与 ssh-keygen 磁盘输出一致
		return { privateKey: out.key + '\n', publicKey: out.pubKey + '\n' };
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		// 库在 stderr 分支下不会删除文件，抛 400 交给上层
		throw new SshKeygenError(400, message);
	} finally {
		// 兜底清理临时文件（destroy 或 stderr 分支后 init 残留）
		fs.rmSync(location, { force: true });
		fs.rmSync(location + '.pub', { force: true });
	}
}

/**
 * 一键修复：自动安装 openssh（ssh-keygen）。
 * 若已可用则直接返回当前状态，不执行安装。
 * 按平台与可用包管理器选择安装命令（apt / dnf / yum / apk / zypper / brew）。
 * 优先检测是否有免密 sudo（sudo -n true），有则加 sudo，否则直接以当前用户执行。
 * 安装完成后立即重新检测可用性，返回最新状态。
 */
export async function installSshKeygen(): Promise<SshKeygenAvailability> {
	// 已可用则无需安装
	const current = getSshKeygenAvailability();
	if (current.available) return current;

	const platform = os.platform();
	let cmd: string;
	let args: string[];

	if (platform === 'linux') {
		// Linux：按包管理器探测（按常见度排序）
		const pm = detectLinuxPkgManager();
		if (!pm) {
			return {
				available: false,
				error: '未能识别的 Linux 包管理器，请手动安装 openssh-client（apt/dnf/yum/apk/zypper 之一）'
			};
		}
		cmd = pm.cmd;
		args = pm.args;
	} else if (platform === 'darwin') {
		// macOS：优先 Homebrew，缺失时提示手动安装
		cmd = 'brew';
		args = ['install', 'openssh'];
	} else if (platform === 'win32') {
		// Windows：OpenSSH 为系统可选功能，需管理员权限，无法自动安装
		return {
			available: false,
			error: 'Windows 请手动启用 OpenSSH 客户端：设置 → 系统 → 可选功能 → 添加功能 → OpenSSH 客户端'
		};
	} else {
		return { available: false, error: `暂不支持在 ${platform} 上自动安装 OpenSSH` };
	}

	// 免密 sudo 检测：可用则加 sudo 前缀（安装通常需要 root 权限）
	const useSudo = spawnSync('sudo', ['-n', 'true'], { encoding: 'utf8' }).status === 0;
	const fullCmd = useSudo ? 'sudo' : cmd;
	const fullArgs = useSudo ? [cmd, ...args] : args;

	const { status, error, stderr } = await runCommand(fullCmd, fullArgs);
	if (error || status !== 0) {
		const detail = (stderr || error?.message || '').trim().split('\n').pop() || '';
		return { available: false, error: `安装失败：${detail}` };
	}

	// 安装完成，重新检测
	return getSshKeygenAvailability();
}

/** Linux 包管理器探测：返回安装 openssh 的命令与参数 */
function detectLinuxPkgManager(): { cmd: string; args: string[] } | null {
	// 用 which 探测管理器是否存在
	const has = (bin: string) => spawnSync('which', [bin], { encoding: 'utf8' }).status === 0;
	// Ubuntu/Debian
	if (has('apt-get')) return { cmd: 'apt-get', args: ['install', '-y', 'openssh-client'] };
	// Fedora/RHEL 8+
	if (has('dnf')) return { cmd: 'dnf', args: ['install', '-y', 'openssh-clients'] };
	// CentOS 7 / RHEL 7
	if (has('yum')) return { cmd: 'yum', args: ['install', '-y', 'openssh-clients'] };
	// Alpine
	if (has('apk')) return { cmd: 'apk', args: ['add', 'openssh'] };
	// openSUSE
	if (has('zypper')) return { cmd: 'zypper', args: ['install', '-y', 'openssh'] };
	return null;
}

/** 执行命令并等待完成，返回退出码 / 错误 / stderr 尾部 */
function runCommand(
	cmd: string,
	args: string[],
	timeoutMs = 180000
): Promise<{ status: number | null; error?: Error; stderr: string }> {
	return new Promise((resolve) => {
		const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
		let stderr = '';
		child.stderr.on('data', (chunk: Buffer) => {
			stderr += chunk.toString();
		});
		const timer = setTimeout(() => {
			child.kill('SIGKILL');
		}, timeoutMs);
		child.on('error', (err) => {
			clearTimeout(timer);
			resolve({ status: null, error: err, stderr });
		});
		child.on('close', (code) => {
			clearTimeout(timer);
			resolve({ status: code, stderr });
		});
	});
}
