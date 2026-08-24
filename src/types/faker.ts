// Faker 数据生成工具相关类型

/** 支持的生成语言区域 */
export type FakerLocaleKey =
	'zh_CN' | 'en_US' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'pt_BR' | 'ar' | 'ru' | 'th' | 'vi' | 'id_ID' | 'zh_TW';

/** 语言区域选项（含展示用元信息） */
export interface FakerLocaleOption {
	value: FakerLocaleKey;
	label: string;
	english: string;
}

/** 生成数量控制 */
export interface CountRange {
	min: number;
	max: number;
}
