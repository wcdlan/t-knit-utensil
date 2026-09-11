import { reactive } from 'vue';
import defaultConfig from '../../site.config.json';
import type { QuickLink, ShortcutFeature, SiteConfig } from '@/types/site';

export type { FooterConfig, AuthConfig, QuickLink, ShortcutConfig, ShortcutFeature, SiteConfig } from '@/types/site';

export const siteConfig = reactive<SiteConfig>({ ...defaultConfig });

/**
 * 合并快捷键功能列表：旧的单键配置（key 字段）会迁移为搜索功能的一条快捷键，
 * 新配置（features 数组）整体替换。
 */
function mergeShortcutFeatures(features: ShortcutFeature[] | undefined, legacyKey?: string): ShortcutFeature[] {
	if (Array.isArray(features) && features.length > 0) {
		return features.map((f) => ({
			id: f.id,
			label: f.label,
			// 去重并过滤空键
			keys: Array.isArray(f.keys) ? [...new Set(f.keys.filter((k) => typeof k === 'string' && k))] : []
		}));
	}
	// 旧格式：只有单个 key，迁移为搜索功能
	if (typeof legacyKey === 'string' && legacyKey) {
		return [{ id: 'search', label: '工具搜索', keys: [legacyKey] }];
	}
	return siteConfig.shortcut.features;
}

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
		// 快捷键配置整体合并：缺字段时沿用默认值；兼容旧的单键配置（key 字段）
		if (data.shortcut) {
			siteConfig.shortcut = {
				enabled: data.shortcut.enabled ?? siteConfig.shortcut.enabled,
				useCommandOnMac: data.shortcut.useCommandOnMac ?? siteConfig.shortcut.useCommandOnMac,
				features: mergeShortcutFeatures(data.shortcut.features, data.shortcut.key)
			};
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
