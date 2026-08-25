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

/** 自然万物生成类别 */
export type FakerNatureCategory = 'animal' | 'food' | 'color' | 'word';

/** 自然万物生成类别下拉选项 */
export interface FakerNatureCategoryOption {
	label: string;
	value: FakerNatureCategory;
}

/** 单条地址生成结果 */
export interface AddressRecord {
	country: string;
	state: string;
	city: string;
	street: string;
	postal: string;
	latitude: string;
	longitude: string;
	timeZone: string;
}

/** 单条企业信息生成结果 */
export interface CompanyRecord {
	name: string;
	catchPhrase: string;
	buzzPhrase: string;
	department: string;
	jobTitle: string;
	product: string;
	price: string;
}

/** 单条车辆信息生成结果 */
export interface VehicleRecord {
	vehicle: string;
	manufacturer: string;
	model: string;
	type: string;
	fuel: string;
	vin: string;
	plate: string;
	color: string;
}
