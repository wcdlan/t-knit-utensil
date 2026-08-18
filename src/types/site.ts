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

export interface SiteConfig {
	siteName: string;
	siteDescription: string;
	footer: FooterConfig;
	auth: AuthConfig;
	quickLinks: QuickLink[];
}
