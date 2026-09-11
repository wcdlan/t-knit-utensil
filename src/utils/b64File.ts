// 文件与 Base64 互转工具：文件读取、MIME 魔数识别、Base64 还原文件
import { stripBase64Prefix } from '@/utils/base64';
import type { B64FileResult, B64RestoreInfo } from '@/types/base64';

export type { B64FileMeta, B64FileOp, B64FileResult, B64RestoreInfo, B64Target, B64TextOp } from '@/types/base64';

/** 常见 MIME 对应的文件扩展名（无点） */
const MIME_EXTENSION: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'image/bmp': 'bmp',
	'image/x-icon': 'ico',
	'application/pdf': 'pdf',
	'application/zip': 'zip',
	'application/x-7z-compressed': '7z',
	'application/x-rar-compressed': 'rar',
	'application/gzip': 'gz',
	'application/x-tar': 'tar',
	'application/json': 'json',
	'application/xml': 'xml',
	'application/javascript': 'js',
	'application/wasm': 'wasm',
	'text/plain': 'txt',
	'text/html': 'html',
	'text/css': 'css',
	'text/csv': 'csv',
	'text/markdown': 'md',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
	'application/msword': 'doc',
	'application/vnd.ms-excel': 'xls',
	'audio/mpeg': 'mp3',
	'audio/wav': 'wav',
	'audio/ogg': 'ogg',
	'audio/mp4': 'm4a',
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'application/octet-stream': 'bin'
};

/** 根据 MIME 取建议扩展名；未知类型回退为 bin */
export function mimeToExtension(mime: string): string {
	return MIME_EXTENSION[mime.toLowerCase()] ?? 'bin';
}

/**
 * 通过文件头魔数识别真实 MIME 类型。
 * 优先于 Data URI 中声明的类型，可识别常见图片 / 文档 / 压缩包 / 音视频。
 */
export function sniffMimeType(bytes: Uint8Array): string {
	const prefix = (n: number) =>
		Array.from(bytes.slice(0, n))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

	if (bytes.length >= 8 && prefix(8) === '89504e470d0a1a0a') return 'image/png';
	if (bytes.length >= 3 && prefix(3) === 'ffd8ff') return 'image/jpeg';
	if (bytes.length >= 6 && (prefix(6) === '47494638' || /^474946383[79]61$/.test(prefix(6)))) return 'image/gif';
	if (bytes.length >= 12 && prefix(4) === '52494646' && prefix(8).slice(4) === '57454250') return 'image/webp';
	if (bytes.length >= 2 && prefix(2) === '424d') return 'image/bmp';
	if (bytes.length >= 4 && prefix(4) === '00000100') return 'image/x-icon';
	if (bytes.length >= 4 && prefix(4) === '25504446') return 'application/pdf';
	if (bytes.length >= 4 && prefix(4) === '504b0304') return 'application/zip';
	if (bytes.length >= 6 && prefix(6) === '377abcaf271c') return 'application/x-7z-compressed';
	if (bytes.length >= 4 && prefix(4) === '52617221') return 'application/x-rar-compressed';
	if (bytes.length >= 2 && prefix(2) === '1f8b') return 'application/gzip';
	if (bytes.length >= 4 && prefix(4) === '7f454c46') return 'application/x-elf';
	if (bytes.length >= 4 && prefix(4) === '66747970') return 'video/mp4';
	if (bytes.length >= 4 && prefix(4) === '1a45dfa3') return 'video/webm';
	if (bytes.length >= 3 && prefix(3) === '494433') return 'audio/mpeg';
	if (bytes.length >= 4 && prefix(4) === '52494646') return 'audio/wav';
	if (bytes.length >= 4 && prefix(4) === '4f676753') return 'audio/ogg';
	return '';
}

/** 判断 MIME 是否可内联预览（图片 / 文本 / 常见文档） */
export function isPreviewableMime(mime: string): boolean {
	const m = mime.toLowerCase();
	return (
		m.startsWith('image/') ||
		m.startsWith('text/') ||
		m === 'application/json' ||
		m === 'application/xml' ||
		m === 'application/javascript' ||
		m === 'application/pdf'
	);
}

/** 尝试将字节按 UTF-8 严格解码，非法序列返回 null */
function tryDecodeUtf8(bytes: Uint8Array): string | null {
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
	} catch {
		return null;
	}
}

/** 无魔数时按文本内容启发式推断 MIME：JSON / HTML / XML / 纯文本 */
function sniffTextMime(bytes: Uint8Array): string {
	const text = tryDecodeUtf8(bytes);
	if (text === null) return '';
	const trimmed = text.trimStart();
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'application/json';
	if (/^<!doctype html/i.test(trimmed) || /^<html/i.test(trimmed)) return 'text/html';
	if (trimmed.startsWith('<?xml')) return 'application/xml';
	return 'text/plain';
}

/** 将任意 File 读取为 Base64（返回带 MIME 头的 Data URI 与纯数据） */
export function fileToBase64(file: File): Promise<B64FileResult> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUri = reader.result as string;
			resolve({
				dataUri,
				raw: stripBase64Prefix(dataUri),
				mime: file.type || 'application/octet-stream',
				size: file.size
			});
		};
		reader.onerror = () => reject(new Error('文件读取失败'));
		reader.readAsDataURL(file);
	});
}

/** 将纯 Base64 数据解析为字节数组（剔除空白） */
export function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64.replace(/\s+/g, ''));
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

/**
 * 将 Base64 内容还原为文件信息。
 * 优先使用 Data URI 声明的 MIME，再以魔数识别的结果为准；两者皆无时回退为
 * application/octet-stream。
 */
export function restoreFromBase64(input: string): B64RestoreInfo {
	const content = stripBase64Prefix(input.trim()).replace(/\s+/g, '');
	if (!content) throw new Error('Base64 内容为空');

	let bytes: Uint8Array;
	try {
		bytes = base64ToBytes(content);
	} catch {
		throw new Error('不是合法的 Base64 编码');
	}

	const declaredMime = /^data:([^;,]+)[;,]/.exec(input.trim())?.[1] ?? '';
	const sniffed = sniffMimeType(bytes);
	// 优先级：文件魔数 > 文本内容启发式 > Data URI 声明 > 通用二进制
	const mime = sniffed || sniffTextMime(bytes) || declaredMime || 'application/octet-stream';

	return {
		mime,
		extension: mimeToExtension(mime),
		size: bytes.length,
		previewable: isPreviewableMime(mime),
		previewHint: mime === 'application/octet-stream' ? '无法识别文件类型，预览不可用' : ''
	};
}

/** 将 Base64 数据还原为 Blob（供下载 / 预览） */
export function base64ToBlob(input: string, mime: string): Blob {
	const bytes = base64ToBytes(stripBase64Prefix(input.trim()));
	// slice() 返回新的标准 ArrayBuffer 视图，避免原视图可能携带偏移或 SharedArrayBuffer 导致类型不匹配
	const copy = bytes.slice();
	return new Blob([copy], { type: mime || 'application/octet-stream' });
}
