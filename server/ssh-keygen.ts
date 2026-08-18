import { spawnSync } from 'node:child_process';
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
