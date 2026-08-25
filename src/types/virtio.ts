// VirtIO 驱动下载工具相关类型

/** VirtIO 归档版本信息 */
export interface VirtioVersion {
	name: string;
	date: string;
}

/** 单个版本目录下的文件信息 */
export interface VirtioFile {
	name: string;
	size: string;
	date: string;
}
