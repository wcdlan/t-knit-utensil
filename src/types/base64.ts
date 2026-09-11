// Base64 转换工具相关类型

/** 转换对象：文本 / 文件 */
export type B64Target = 'text' | 'file';

/** 文本操作方向：编码 / 解码 */
export type B64TextOp = 'encode' | 'decode';

/** 文件操作方向：文件转 Base64 / Base64 还原文件 */
export type B64FileOp = 'to-base64' | 'from-base64';

/** 已上传文件的基本信息 */
export interface B64FileMeta {
	name: string;
	size: number;
	type: string;
}

/** 文件转 Base64 的结果 */
export interface B64FileResult {
	/** 完整 Data URI（含 MIME 头） */
	dataUri: string;
	/** 纯 Base64 数据（不含头） */
	raw: string;
	/** MIME 类型 */
	mime: string;
	/** 文件字节数 */
	size: number;
}

/** Base64 还原文件的解析信息 */
export interface B64RestoreInfo {
	/** 识别出的 MIME 类型 */
	mime: string;
	/** 建议的扩展名（不含点） */
	extension: string;
	/** 还原出的字节数 */
	size: number;
	/** 是否可内联预览（图片 / 文本 / JSON / PDF 等） */
	previewable: boolean;
	/** 预览提示文案 */
	previewHint: string;
}
