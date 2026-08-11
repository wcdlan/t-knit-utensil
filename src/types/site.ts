export interface FooterConfig {
	copyright: string;
	icp: string;
	icpUrl: string;
	poweredBy: string;
}

export interface AuthConfig {
	password: string;
}

export interface SiteConfig {
	siteName: string;
	siteDescription: string;
	footer: FooterConfig;
	auth: AuthConfig;
}
