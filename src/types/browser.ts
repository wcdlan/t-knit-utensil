// 浏览器信息工具相关类型

/** 单条信息（标签 + 值） */
export interface BrowserInfoItem {
	label: string;
	/** 展示值（缺失时调用方传「未知」） */
	value: string;
	/** 是否使用等宽字体展示（如 UA、指纹、版本号） */
	mono?: boolean;
}

/** 一组信息（对应页面上一张卡片） */
export interface BrowserInfoSection {
	id: string;
	/** 卡片标题 */
	title: string;
	/** 卡片图标（icons 中的 mdi 名） */
	icon: string;
	items: BrowserInfoItem[];
}

/** 能力 / 特性检测条目 */
export interface CapabilityItem {
	label: string;
	/** 当前浏览器是否支持 */
	supported: boolean;
	/** 补充说明（如版本号、渲染器名称） */
	detail?: string;
}

/** User-Agent 解析结果 */
export interface UserAgentInfo {
	/** 浏览器名称 */
	browser: string;
	/** 浏览器完整版本 */
	browserVersion: string;
	/** 渲染引擎 / 内核 */
	engine: string;
	/** 引擎版本 */
	engineVersion: string;
	/** 操作系统名称 */
	os: string;
	/** 操作系统版本 */
	osVersion: string;
	/** 设备类型 */
	deviceType: string;
	/** 是否为移动设备 */
	mobile: boolean;
	/** 是否为爬虫 / 自动化工具 */
	bot: boolean;
}

/** WebGL 显卡信息 */
export interface GpuInfo {
	/** 显卡厂商 */
	vendor: string;
	/** 显卡型号 / 渲染器 */
	renderer: string;
	/** WebGL 版本 */
	webglVersion: string;
	/** 最大纹理尺寸 */
	maxTextureSize: string;
}

/** 电池状态（Battery Status API，非标准） */
export interface BatteryInfo {
	charging: boolean;
	/** 电量百分比 */
	levelPercent: number;
	/** 充满剩余时间文案 */
	chargingTimeText: string;
	/** 可用剩余时间文案 */
	dischargingTimeText: string;
}

/** 存储能力与配额 */
export interface StorageInfo {
	localStorage: boolean;
	sessionStorage: boolean;
	indexedDB: boolean;
	cookies: boolean;
	/** 已使用字节数（不可用时为 null） */
	usageBytes: number | null;
	/** 配额字节数（不可用时为 null） */
	quotaBytes: number | null;
	/** 是否已申请持久化存储 */
	persisted: boolean;
}

/** 公网 IP 及归属信息（经服务端 /api/proxy 转发查询） */
export interface PublicNetworkInfo {
	ip: string;
	country: string;
	region: string;
	city: string;
	isp: string;
	org: string;
	asn: string;
	timezone: string;
	/** 经纬度（部分接口提供） */
	location: string;
}

/** 异步补充信息（电池 / 存储 / 公网 IP / 刷新率） */
export interface BrowserInfoExtras {
	battery: BatteryInfo | null;
	storage: StorageInfo | null;
	publicNetwork: PublicNetworkInfo | null;
	/** 实测屏幕刷新率（Hz），未检测为 null */
	refreshRate: number | null;
}

/** 网络连接信息（Network Information API，非标准） */
export interface NetworkInformationLike {
	effectiveType?: string;
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
	type?: string;
	addEventListener?: (type: string, listener: () => void) => void;
}

/** UA Client Hints 的品牌条目 */
export interface UserAgentBrand {
	brand: string;
	version: string;
}

/** UA Client Hints（Chromium 系提供的高熵信息） */
export interface UserAgentDataLike {
	platform?: string;
	mobile?: boolean;
	brands?: UserAgentBrand[];
	getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>;
}

/** 电池对象（非标准 API 的最小可用形态） */
export interface BatteryLike {
	charging: boolean;
	level: number;
	chargingTime: number;
	dischargingTime: number;
}

/** 带非标准扩展的 navigator（统一在此声明，避免组件内重复断言） */
export interface NavigatorWithExtras extends Navigator {
	deviceMemory?: number;
	connection?: NetworkInformationLike;
	userAgentData?: UserAgentDataLike;
	getBattery?: () => Promise<BatteryLike>;
}

/** Chrome 专有的内存信息 */
export interface PerformanceMemoryLike {
	usedJSHeapSize: number;
	totalJSHeapSize: number;
	jsHeapSizeLimit: number;
}

/** 带内存扩展的 performance */
export interface PerformanceWithMemory extends Performance {
	memory?: PerformanceMemoryLike;
}
