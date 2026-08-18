export type KeyType = 'rsa-2048' | 'rsa-3072' | 'rsa-4096' | 'ecdsa-p256' | 'ecdsa-p384' | 'ecdsa-p521';

export interface KeyTypeMeta {
	label: string;
	sshType: 'rsa' | 'ecdsa';
	size: string;
}

export interface KeyPairResult {
	privateKeyPem: string;
	publicKeySsh: string;
}

export interface SshKeygenCheckResult {
	ok: boolean;
	available: boolean;
	version?: string;
	error?: string;
}

export interface SshKeygenGenerateRequest {
	type: KeyType;
	comment?: string;
	passphrase?: string;
}

export interface SshKeygenGenerateResponse {
	ok: boolean;
	privateKey?: string;
	publicKey?: string;
	error?: string;
}
