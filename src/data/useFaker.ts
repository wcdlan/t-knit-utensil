import { shallowRef } from 'vue';
import { DEFAULT_FAKER_LOCALE, type FakerInstance, getFaker } from '@/data/fakerLocales';
import { faker as zhCN } from '@faker-js/faker/locale/zh_CN';
import type { FakerLocaleKey } from '@/types/faker';

/**
 * 共享 Faker 生成逻辑 composable：
 * - 管理当前语言区域（默认中文 zh_CN，静态引入立即可用）
 * - 其余语言按需动态加载（fakerLocales 中的动态 import）
 * - 语言切换完成后通过 onLocaleChanged 回调通知页面重新生成
 *
 * 注意：Faker 实例内部模块存在互相引用，需用 shallowRef 而非 ref，
 * 避免 Vue 的深层解包（UnwrapRef）破坏其结构。
 */
export function useFaker(onLocaleChanged?: () => void) {
	const locale = shallowRef<FakerLocaleKey>(DEFAULT_FAKER_LOCALE);
	const fakerInstance = shallowRef<FakerInstance>(zhCN);
	const loading = shallowRef(false);

	async function setLocale(value: FakerLocaleKey) {
		if (value === locale.value) return;
		locale.value = value;
		loading.value = true;
		try {
			const fk = await getFaker(value);
			fakerInstance.value = fk;
			onLocaleChanged?.();
		} finally {
			loading.value = false;
		}
	}

	function faker(): FakerInstance {
		return fakerInstance.value;
	}

	return { locale, setLocale, faker, loading };
}
