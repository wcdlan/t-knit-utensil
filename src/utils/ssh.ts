// SSH 密钥生成封装：密钥对由后端服务器通过系统 ssh-keygen 二进制生成（见 server/ssh-keygen.ts），
// 前端通过 /api/ssh-keygen/* 接口调用，不在浏览器内执行任何加密计算。

import type {
	KeyPairResult,
	KeyType,
	KeyTypeMeta,
	SshKeygenCheckResult,
	SshKeygenGenerateRequest,
	SshKeygenGenerateResponse
} from '@/types/ssh';

export type { KeyType, KeyPairResult } from '@/types/ssh';

export const KEY_TYPES: Record<KeyType, KeyTypeMeta> = {
	'rsa-2048': { label: 'RSA 2048', sshType: 'rsa', size: '2048' },
	'rsa-3072': { label: 'RSA 3072', sshType: 'rsa', size: '3072' },
	'rsa-4096': { label: 'RSA 4096', sshType: 'rsa', size: '4096' },
	'ecdsa-p256': { label: 'ECDSA P-256', sshType: 'ecdsa', size: '256' },
	'ecdsa-p384': { label: 'ECDSA P-384', sshType: 'ecdsa', size: '384' },
	'ecdsa-p521': { label: 'ECDSA P-521', sshType: 'ecdsa', size: '521' }
};

/**
 * 生成 SSH 密钥对：请求后端服务端调用系统 ssh-keygen 生成，返回 OpenSSH 私钥 + 公钥。
 */
export async function generateKeyPair(keyType: KeyType, passphrase?: string, comment?: string): Promise<KeyPairResult> {
	const payload = {
		type: keyType,
		passphrase: passphrase ?? '',
		comment: comment ?? ''
	} satisfies SshKeygenGenerateRequest;
	const res = await fetch('/api/ssh-keygen/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
	const data = (await res.json().catch(() => null)) as SshKeygenGenerateResponse | null;
	if (!res.ok || !data?.ok || !data.privateKey || !data.publicKey) {
		throw new Error(data?.error || `生成失败（HTTP ${res.status}）`);
	}
	return { privateKeyPem: data.privateKey, publicKeySsh: data.publicKey };
}

/**
 * 检测后端所在系统是否安装了 ssh-keygen 二进制。
 */
export async function checkSshKeygen(): Promise<{ available: boolean; version?: string }> {
	try {
		const res = await fetch('/api/ssh-keygen/check');
		const data = (await res.json()) as SshKeygenCheckResult;
		return { available: !!data.ok && !!data.available, version: data.version };
	} catch {
		return { available: false };
	}
}
