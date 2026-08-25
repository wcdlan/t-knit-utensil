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
