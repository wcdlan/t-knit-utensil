export interface FooterConfig {
	copyright: string;
	icp: string;
	icpUrl: string;
	poweredBy: string;
}

export interface AuthConfig {
	password: string;
}

export interface QuickLink {
	icon: string; // Iconify 图标名（如 "mdi:github"），或自定义上传图标的 Data URL / 图片地址
	name: string; // 可选，用作首页 hover 提示；允许空字符串
	url: string;
	newTab: boolean; // 新标签页打开（true）还是当前页打开（false）
}

/** 快捷链接图标选项（图标选择浮层数据源） */
export interface QuickLinkIconOption {
	/** 图标名称（悬停提示） */
	label: string;
	/** 图标值：Iconify 图标名（mdi: 前缀） */
	value: string;
}

/** 快捷链接图标分组（按用途分组，便于在浮层中快速定位） */
export interface QuickLinkIconGroup {
	/** 分组名称 */
	label: string;
	/** 分组内的图标选项 */
	options: QuickLinkIconOption[];
}

/** 单个功能的快捷键配置：一个功能可绑定多个触发键（如搜索支持 Ctrl+/ 与 Ctrl+\） */
export interface ShortcutFeature {
	/** 功能标识，如 "search"（呼出工具搜索） */
	id: string;
	/** 功能显示名称 */
	label: string;
	/** 触发键列表（不含修饰键），如 ["/", "\\"] */
	keys: string[];
}

/** 全局快捷键配置：功能列表形式，便于后续新增功能 */
export interface ShortcutConfig {
	/** 是否启用全局快捷键 */
	enabled: boolean;
	/** 在 Mac 上是否用 Command（⌘）键替代 Ctrl（⌃）键 */
	useCommandOnMac: boolean;
	/** 功能快捷键列表 */
	features: ShortcutFeature[];
}

export interface SiteConfig {
	siteName: string;
	siteDescription: string;
	footer: FooterConfig;
	auth: AuthConfig;
	quickLinks: QuickLink[];
	shortcut: ShortcutConfig;
}

/** 系统配置页的子导航分组标识 */
export type SettingsTabKey = 'site' | 'footer' | 'quickLinks' | 'security' | 'system' | 'shortcut';
