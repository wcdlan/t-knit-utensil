/**
 * Base64 编码工具（UTF-8 安全）。
 *
 * 使用现代 Web API（TextEncoder / TextDecoder / Uint8Array）实现，
 * 禁止使用已弃用的 escape / unescape。
 */

/**
 * 将 UTF-8 字符串编码为 Base64。
 * 等价于旧写法 `btoa(unescape(encodeURIComponent(str)))`，但基于 TextEncoder。
 */
export function encodeBase64(str: string): string {
	const bytes = new TextEncoder().encode(str);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * 将 Base64 字符串解码为 UTF-8 字符串。
 * 等价于旧写法 `decodeURIComponent(escape(atob(str)))`，但基于 TextDecoder。
 */
export function decodeBase64(base64: string): string {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/** 将字节数组转换为二进制字符串（供 btoa 使用） */
function bytesToBinary(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return binary;
}

/** 将二进制字符串转换为字节数组（供 TextDecoder 使用） */
function binaryToBytes(binary: string): Uint8Array {
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/**
 * Base64URL 编码（RFC 4648 §5）：把 Base64 的 `+` `/` 分别替换为 `-` `_`，并去掉末尾填充 `=`。
 * 常用于 JWT 各段、URL 参数等场景。
 */
export function encodeBase64Url(input: string | Uint8Array): string {
	const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
	return btoa(bytesToBinary(bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Base64URL 解码为 UTF-8 字符串（自动补全缺失的 `=` 填充） */
export function decodeBase64Url(input: string): string {
	const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
	return new TextDecoder().decode(binaryToBytes(atob(padded)));
}

/** 从 Data URI 中解析出 MIME 类型（如 image/png），无头信息时返回空字符串 */
export function extractMimeType(dataUri: string): string {
	const match = /^data:([^;,]+)[;,]/.exec(dataUri);
	return match ? match[1] : '';
}

/** 从带头的完整 Base64 中剥离 Data URI 头，仅返回纯数据部分 */
export function stripBase64Prefix(base64: string): string {
	const idx = base64.indexOf(',');
	return idx === -1 ? base64 : base64.slice(idx + 1);
}

/** 由纯 Base64 数据 + MIME 类型拼出带 Data URI 头的字符串 */
export function buildDataUri(base64: string, mime: string): string {
	return `data:${mime || 'application/octet-stream'};base64,${stripBase64Prefix(base64)}`;
}

/** 判断内容是否是合法的 Base64（剔除空白与 Data URI 头后尝试解码） */
export function isValidBase64Content(base64: string): boolean {
	const content = stripBase64Prefix(base64).replace(/\s+/g, '');
	if (!content) return false;
	try {
		return atob(content).length > 0;
	} catch {
		return false;
	}
}
