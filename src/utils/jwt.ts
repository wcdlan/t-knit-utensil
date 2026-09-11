// JWT 解析 / 生成：Base64URL 分段解码、标准声明解读、HMAC 签名与验签
import { decodeBase64Url, encodeBase64Url } from '@/utils/base64';
import type {
	JwtAlgorithm,
	JwtAlgorithmOption,
	JwtClaimInfo,
	JwtDecoded,
	JwtDecodeState,
	JwtHeader,
	JwtPayload,
	JwtTimeStatus,
	JwtVerifyResult
} from '@/types/jwt';

export type {
	JwtAlgorithm,
	JwtAlgorithmOption,
	JwtClaimInfo,
	JwtDecodeState,
	JwtDecoded,
	JwtHeader,
	JwtMode,
	JwtPayload,
	JwtTimeStatus,
	JwtVerifyResult
} from '@/types/jwt';

/** 支持的 HMAC 算法选项（含 Web Crypto 导入参数说明） */
export const JWT_ALGORITHM_OPTIONS: JwtAlgorithmOption[] = [
	{ label: 'HS256', value: 'HS256', description: 'HMAC + SHA-256（最常用）' },
	{ label: 'HS384', value: 'HS384', description: 'HMAC + SHA-384' },
	{ label: 'HS512', value: 'HS512', description: 'HMAC + SHA-512' }
];

/** 标准声明解读表 */
const CLAIM_DICTIONARY: Record<string, string> = {
	iss: '签发者（Issuer）',
	sub: '主题（Subject）',
	aud: '受众（Audience）',
	exp: '过期时间（Expiration Time）',
	nbf: '生效时间（Not Before）',
	iat: '签发时间（Issued At）',
	jti: 'JWT 唯一标识（JWT ID）',
	scope: '授权范围（Scope）',
	azp: '授权方（Authorized Party）',
	typ: '令牌类型',
	alg: '签名算法',
	kid: '密钥标识（Key ID）',
	nonce: '随机数（Nonce）',
	sid: '会话标识（Session ID）',
	email: '邮箱',
	name: '名称',
	role: '角色',
	roles: '角色列表'
};

/** 需要按 Unix 秒解析为可读时间的声明 */
const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat', 'auth_time', 'updated_at']);

/** 官方示例 token（jwt.io 的 HS256 标准测试向量，密钥 your-256-bit-secret） */
export const JWT_EXAMPLE_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
	'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
	'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

/** 示例 token 对应的密钥 */
export const JWT_EXAMPLE_SECRET = 'your-256-bit-secret';

/** 生成模式默认 Header */
export const JWT_DEFAULT_HEADER = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';

/** 生成模式默认 Payload（含标准声明） */
export const JWT_DEFAULT_PAYLOAD = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "admin": true\n}';

/** 生成一段随机 HMAC 密钥（32 字节十六进制） */
export function generateJwtSecret(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/** 将 Unix 秒时间戳格式化为本地可读时间 */
export function formatUnixTime(seconds: number): string {
	const date = new Date(seconds * 1000);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return (
		`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
		`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
	);
}

/** 将声明值转为可展示的字符串 */
function stringifyClaim(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value === null || value === undefined) return String(value);
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

/**
 * 归一化 token 输入：去除首尾空白、`Bearer ` 前缀，以及换行/空格带来的干扰。
 */
export function normalizeToken(input: string): string {
	return input
		.trim()
		.replace(/^Bearer\s+/i, '')
		.replace(/\s+/g, '');
}

/** 判断一个值是否为普通对象（非数组、非 null） */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 解析 JWT：拆分三段并解码 Header / Payload。
 * 不校验签名（签名校验由 verifyJwt 负责），因此可解析任意 token。
 */
export function decodeJwt(input: string): JwtDecodeState {
	const raw = normalizeToken(input);
	if (!raw) return { decoded: null, error: '' };

	const segments = raw.split('.');
	if (segments.length !== 3) {
		return {
			decoded: null,
			error: `JWT 应包含 3 段（Header.Payload.Signature），当前为 ${segments.length} 段`
		};
	}

	const [headerSegment, payloadSegment, signatureSegment] = segments;

	try {
		const header = JSON.parse(decodeBase64Url(headerSegment));
		const payload = JSON.parse(decodeBase64Url(payloadSegment));
		if (!isPlainObject(header)) return { decoded: null, error: 'Header 不是合法的 JSON 对象' };
		if (!isPlainObject(payload)) return { decoded: null, error: 'Payload 不是合法的 JSON 对象' };
		return {
			decoded: {
				raw,
				headerSegment,
				payloadSegment,
				signatureSegment,
				header: header as JwtHeader,
				payload: payload as JwtPayload
			},
			error: ''
		};
	} catch (e) {
		return { decoded: null, error: 'JWT 解析失败，Base64URL 或 JSON 格式有误：' + (e as Error).message };
	}
}

/** 将声明按时间换算与含义说明整理为展示条目 */
export function describeClaims(payload: JwtPayload): JwtClaimInfo[] {
	const now = Math.floor(Date.now() / 1000);
	return Object.entries(payload).map(([key, value]) => {
		const info: JwtClaimInfo = {
			key,
			label: CLAIM_DICTIONARY[key] ?? '自定义声明',
			value: stringifyClaim(value),
			description: CLAIM_DICTIONARY[key] ? '标准声明' : '业务自定义字段'
		};

		if (TIME_CLAIMS.has(key) && typeof value === 'number' && Number.isFinite(value)) {
			info.time = formatUnixTime(value);
			if (key === 'exp') {
				const expired = value <= now;
				info.status = expired ? '已过期' : '有效期内';
				info.statusType = expired ? 'error' : 'success';
			} else if (key === 'nbf') {
				const future = value > now;
				info.status = future ? '尚未生效' : '已生效';
				info.statusType = future ? 'warning' : 'success';
			}
		}
		return info;
	});
}

/** 计算 token 的时间有效性状态 */
export function getTimeStatus(payload: JwtPayload): JwtTimeStatus {
	const now = Math.floor(Date.now() / 1000);
	const exp = payload.exp;
	const nbf = payload.nbf;
	return {
		expired: typeof exp === 'number' && Number.isFinite(exp) && exp <= now,
		notYetValid: typeof nbf === 'number' && Number.isFinite(nbf) && nbf > now
	};
}

/** 按算法名取 Web Crypto 的哈希名称 */
function hashNameOf(algorithm: JwtAlgorithm): string {
	return 'SHA-' + algorithm.slice(2);
}

/** 导入 HMAC 密钥（签名与验签共用） */
async function importHmacKey(secret: string, algorithm: JwtAlgorithm): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: hashNameOf(algorithm) },
		false,
		['sign', 'verify']
	);
}

/** 用 HMAC 密钥对 `header.payload` 计算签名段（Base64URL） */
export async function signJwt(header: JwtHeader, payload: JwtPayload, secret: string): Promise<string> {
	const algorithm = (header.alg ?? 'HS256') as JwtAlgorithm;
	if (!JWT_ALGORITHM_OPTIONS.some((o) => o.value === algorithm)) {
		throw new Error(`不支持的签名算法：${algorithm}（本工具仅支持 HS256 / HS384 / HS512）`);
	}
	const signingInput = encodeBase64Url(JSON.stringify(header)) + '.' + encodeBase64Url(JSON.stringify(payload));
	const key = await importHmacKey(secret, algorithm);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
	return signingInput + '.' + encodeBase64Url(new Uint8Array(signature));
}

/** 校验 token 签名是否与给定密钥匹配 */
export async function verifyJwt(decoded: JwtDecoded, secret: string): Promise<JwtVerifyResult> {
	const algorithm = decoded.header.alg as JwtAlgorithm;
	if (!JWT_ALGORITHM_OPTIONS.some((o) => o.value === algorithm)) {
		return { valid: false, message: `无法校验：算法 ${decoded.header.alg ?? '未知'} 不属于 HS256 / HS384 / HS512` };
	}
	if (!secret) return { valid: false, message: '请输入密钥后再校验签名' };

	try {
		const key = await importHmacKey(secret, algorithm);
		const signingInput = decoded.headerSegment + '.' + decoded.payloadSegment;
		const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
		const expected = encodeBase64Url(new Uint8Array(signature));
		const valid = expected === decoded.signatureSegment;
		return {
			valid,
			message: valid ? '签名校验通过，token 未被篡改' : '签名校验失败，密钥不匹配或 token 已被篡改'
		};
	} catch (e) {
		return { valid: false, message: '校验失败：' + (e as Error).message };
	}
}
