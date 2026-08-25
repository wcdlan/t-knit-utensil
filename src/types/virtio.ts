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

/**
 * 各 Windows 系统对 VirtIO 驱动的推荐版本关系。
 * useLatest 为 true 时直接推荐归档中的最新版；否则按 recommended 中的候选版本号
 * （如 0.1.190）逐个在归档中匹配，匹配到的第一个即最推荐版本。
 */
export interface VirtioOsRecommendation {
	/** 操作系统名称（如 Windows 11、Windows XP） */
	osName: string;
	/** 是否推荐直接使用最新版 */
	useLatest: boolean;
	/** 候选推荐版本号（按优先级从高到低，useLatest 为 true 时忽略） */
	recommended: string[];
}

/** 推荐面板中的一行（由 view 基于版本列表解析生成） */
export interface VirtioRecommendationRow {
	/** 操作系统名称 */
	osName: string;
	/** 是否推荐最新版 */
	isLatest: boolean;
	/** 归档中匹配到的版本目录名（如 virtio-win-0.1.190-1；不可用时为空串） */
	versionName: string;
	/** 展示用的版本号（如 0.1.190；最新版时为「最新版」） */
	versionLabel: string;
	/** 该版本在归档中是否可用（可点击选中） */
	available: boolean;
}
