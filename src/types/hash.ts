// 哈希工具相关类型

/** 支持的哈希算法 */
export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

/** 哈希算法下拉选项 */
export interface HashAlgorithmOption {
	label: string;
	value: HashAlgorithm;
}
