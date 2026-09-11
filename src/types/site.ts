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
	icon: string; // iconify 图标名（如 "mdi:github"）
	name: string; // 可选，用作首页 hover 提示；允许空字符串
	url: string;
	newTab: boolean; // 新标签页打开（true）还是当前页打开（false）
}

/** 全局快捷键配置：默认 Ctrl+/（Mac 上可按需改用 Command）呼出工具搜索 */
export interface ShortcutConfig {
	/** 是否启用全局快捷键 */
	enabled: boolean;
	/** 触发键（不含修饰键），如 "/"、空格等 */
	key: string;
	/** 在 Mac 上是否用 Command（⌘）键替代 Ctrl（⌃）键 */
	useCommandOnMac: boolean;
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
