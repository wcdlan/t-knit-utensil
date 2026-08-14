import { reactive } from 'vue';
import defaultConfig from '../../site.config.json';
import type { SiteConfig } from '@/types/site';

export type { FooterConfig, AuthConfig, SiteConfig } from '@/types/site';

export const siteConfig = reactive<SiteConfig>({ ...defaultConfig });

export async function loadConfig() {
	try {
		const res = await fetch('/api/config');
		const data = await res.json();
		// 深合并：保留默认值，运行时 db 缺字段时落默认，避免嵌套对象被整体替换清空
		siteConfig.siteName = data.siteName ?? siteConfig.siteName;
		siteConfig.siteDescription = data.siteDescription ?? siteConfig.siteDescription;
		siteConfig.footer = { ...siteConfig.footer, ...data.footer };
		siteConfig.auth = { ...siteConfig.auth, ...data.auth };
	} catch {
		// use default config
	}
}

export async function saveConfig(): Promise<boolean> {
	try {
		const res = await fetch('/api/config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(siteConfig)
		});
		return res.ok;
	} catch {
		return false;
	}
}
