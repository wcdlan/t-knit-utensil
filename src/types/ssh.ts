export type KeyType = 'rsa-2048' | 'rsa-3072' | 'rsa-4096' | 'ecdsa-p256' | 'ecdsa-p384' | 'ecdsa-p521';

export interface KeyPairResult {
	privateKeyPem: string;
	publicKeySsh: string;
}

export interface KeyTypeMeta {
	label: string;
	sshAlgorithm: string;
	curveOid?: number[]; // for ECDSA, the curve OID used in SSH wire format
}
