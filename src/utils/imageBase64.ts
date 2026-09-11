/**
 * 图片与 Base64 互转工具函数。
 *
 * 通用函数（extractMimeType / stripBase64Prefix / buildDataUri / isValidBase64Content）
 * 已迁移至 src/utils/base64.ts，此处重导出以保持向后兼容。
 */

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

export { buildDataUri, extractMimeType, isValidBase64Content, stripBase64Prefix } from '@/utils/base64';
