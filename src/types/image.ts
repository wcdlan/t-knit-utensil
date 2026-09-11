export interface FaviconSize {
	size: number;
	label: string;
	selected: boolean;
}

/**
 * 图片与 Base64 互转工具的操作模式。
 * - image-to-base64：图片 → Base64
 * - base64-to-image：Base64 → 图片
 */
export type ImageBase64Mode = 'image-to-base64' | 'base64-to-image';

/** 图片信息（文件名 / 大小 / 类型） */
export interface ImageFileMeta {
	name: string;
	size: number;
	type: string;
}
