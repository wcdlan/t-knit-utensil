import { faker as zhCN } from '@faker-js/faker/locale/zh_CN';
import type { FakerLocaleKey, FakerLocaleOption } from '@/types/faker';

/**
 * 语言区域注册表：
 * - 默认语言「中文（简体）」静态引入，保证首次进入工具立即可用
 * - 其余语言按需动态加载（Vite 自动 code-split），避免首屏一次性拉取全部词库
 *
 * 类型说明：locale 子路径导出的 faker 实例类型（来自 core 分块）与主入口的 Faker 类型
 * 在 TS 视角下不是同一类型，因此这里用 `typeof zhCN` 作为统一的实例类型，避免双包类型冲突。
 */
const DEFAULT_LOCALE = 'zh_CN' as const;

/** 统一的 faker 实例类型（从 locale 子路径推导） */
export type FakerInstance = typeof zhCN;

const FAKER_LOCALE_LOADERS: Record<Exclude<FakerLocaleKey, 'zh_CN'>, () => Promise<FakerInstance>> = {
	en_US: () => import('@faker-js/faker/locale/en_US').then((m) => m.faker),
	ja: () => import('@faker-js/faker/locale/ja').then((m) => m.faker),
	ko: () => import('@faker-js/faker/locale/ko').then((m) => m.faker),
	de: () => import('@faker-js/faker/locale/de').then((m) => m.faker),
	fr: () => import('@faker-js/faker/locale/fr').then((m) => m.faker),
	es: () => import('@faker-js/faker/locale/es').then((m) => m.faker),
	pt_BR: () => import('@faker-js/faker/locale/pt_BR').then((m) => m.faker),
	ar: () => import('@faker-js/faker/locale/ar').then((m) => m.faker),
	ru: () => import('@faker-js/faker/locale/ru').then((m) => m.faker),
	th: () => import('@faker-js/faker/locale/th').then((m) => m.faker),
	vi: () => import('@faker-js/faker/locale/vi').then((m) => m.faker),
	id_ID: () => import('@faker-js/faker/locale/id_ID').then((m) => m.faker),
	zh_TW: () => import('@faker-js/faker/locale/zh_TW').then((m) => m.faker)
};

/** 语言区域选项（中文 + 英文名），默认中文优先 */
export const FAKER_LOCALE_OPTIONS: FakerLocaleOption[] = [
	{ value: 'zh_CN', label: '中文（简体）', english: 'Chinese (Simplified)' },
	{ value: 'zh_TW', label: '中文（繁体）', english: 'Chinese (Traditional)' },
	{ value: 'en_US', label: '英文（美国）', english: 'English (US)' },
	{ value: 'ja', label: '日语', english: 'Japanese' },
	{ value: 'ko', label: '韩语', english: 'Korean' },
	{ value: 'de', label: '德语', english: 'German' },
	{ value: 'fr', label: '法语', english: 'French' },
	{ value: 'es', label: '西班牙语', english: 'Spanish' },
	{ value: 'pt_BR', label: '葡萄牙语（巴西）', english: 'Portuguese (Brazil)' },
	{ value: 'ar', label: '阿拉伯语', english: 'Arabic' },
	{ value: 'ru', label: '俄语', english: 'Russian' },
	{ value: 'th', label: '泰语', english: 'Thai' },
	{ value: 'vi', label: '越南语', english: 'Vietnamese' },
	{ value: 'id_ID', label: '印度尼西亚语', english: 'Indonesian' }
];

/** 异步获取指定语言区域下的 faker 实例（默认中文立即可用，其余按需加载） */
export async function getFaker(locale: FakerLocaleKey): Promise<FakerInstance> {
	if (locale === DEFAULT_LOCALE) return zhCN;
	return FAKER_LOCALE_LOADERS[locale]();
}

/** 默认语言区域 */
export const DEFAULT_FAKER_LOCALE: FakerLocaleKey = DEFAULT_LOCALE;
