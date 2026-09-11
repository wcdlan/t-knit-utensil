/**
 * 图片与 Base64 互转工具函数。
 *
 * 图片转 Base64 时按需决定是否携带 Data URI 头信息（如
 * data:image/png;base64,），Base64 转图片时兼容带/不带头的两种输入。
 */

/** 从 Data URI 中解析出图片类型（如 image/png），无头信息时返回空字符串 */
export function extractMimeType(dataUri: string): string {
	const match = /^data:([^;,]+)[;,]/.exec(dataUri);
	return match ? match[1] : '';
}

/** 文件类型白名单：仅当属于图片类型才允许进入转换 */
export function isImageType(type: string): boolean {
	return /^image\//i.test(type);
}

/** 将图片 File 异步读取为 Data URI 字符串 */
export function fileToDataUri(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error('图片读取失败'));
		reader.readAsDataURL(file);
	});
}

/** 从带头的完整 Base64 中剥离 Data URI 头，仅返回纯数据部分 */
export function stripBase64Prefix(base64: string): string {
	const idx = base64.indexOf(',');
	return idx === -1 ? base64 : base64.slice(idx + 1);
}

/** 由纯 Base64 数据 + MIME 类型拼出带 Data URI 头的字符串 */
export function buildDataUri(base64: string, mime: string): string {
	return `data:${mime || 'image/png'};base64,${stripBase64Prefix(base64)}`;
}

/** 判断内容是否是合法的 Base64（用于启用在在线预览） */
export function isValidBase64Content(base64: string): boolean {
	const content = stripBase64Prefix(base64);
	if (!content) return false;
	try {
		return atob(content).length > 0;
	} catch {
		return false;
	}
}
