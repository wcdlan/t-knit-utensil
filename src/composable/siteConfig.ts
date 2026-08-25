import { reactive } from 'vue';
import defaultConfig from '../../site.config.json';
import type { QuickLink, SiteConfig } from '@/types/site';

export type { FooterConfig, AuthConfig, QuickLink, SiteConfig } from '@/types/site';

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
		// 数组字段整体替换：展开合并会让已存配置随每次保存重复累积
		if (Array.isArray(data.quickLinks)) {
			// 旧数据缺 newTab 字段时兜底默认新标签页打开，避免 undefined
			siteConfig.quickLinks = data.quickLinks.map((q: QuickLink) => ({
				icon: q.icon ?? '',
				name: q.name ?? '',
				url: q.url ?? '',
				newTab: q.newTab ?? true
			}));
		}
	} catch {
		// 加载失败时使用默认配置
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
