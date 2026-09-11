// JWT 解析 / 生成工具相关类型

/** 操作模式：解析已签发的 token 或生成新 token */
export type JwtMode = 'decode' | 'encode';

/** JWT 头部（alg 为签名算法，其余字段允许扩展） */
export interface JwtHeader {
	alg: string;
	typ?: string;
	kid?: string;
	[key: string]: unknown;
}

/** JWT 载荷（标准声明 + 自定义声明） */
export type JwtPayload = Record<string, unknown>;

/** JWT 解析结果 */
export interface JwtDecoded {
	/** 归一化后的原始 token（已去除 Bearer 前缀与首尾空白） */
	raw: string;
	/** Header 段 Base64URL 原文 */
	headerSegment: string;
	/** Payload 段 Base64URL 原文 */
	payloadSegment: string;
	/** Signature 段 Base64URL 原文 */
	signatureSegment: string;
	header: JwtHeader;
	payload: JwtPayload;
}

/** 解析状态（成功结果或错误信息） */
export interface JwtDecodeState {
	decoded: JwtDecoded | null;
	error: string;
}

/** 支持的 HMAC 签名算法 */
export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

/** 签名算法选项 */
export interface JwtAlgorithmOption {
	label: string;
	value: JwtAlgorithm;
	description: string;
}

/** 声明解读条目 */
export interface JwtClaimInfo {
	/** 声明键名 */
	key: string;
	/** 声明全称 */
	label: string;
	/** 原始值（字符串化） */
	value: string;
	/** 时间类声明的可读时间 */
	time?: string;
	/** 状态文案（如「已过期」） */
	status?: string;
	statusType?: 'default' | 'success' | 'warning' | 'error';
	/** 声明含义说明 */
	description: string;
}

/** 签名校验结果 */
export interface JwtVerifyResult {
	valid: boolean;
	message: string;
}

/** JWT 整体时间状态 */
export interface JwtTimeStatus {
	/** 是否已过期（exp 早于当前时间） */
	expired: boolean;
	/** 是否尚未生效（nbf 晚于当前时间） */
	notYetValid: boolean;
}
