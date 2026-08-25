// 身份信息生成工具相关类型

/** 性别倾向选项值 */
export type IdentitySex = 'any' | 'male' | 'female';

/** 性别倾向选项 */
export interface IdentitySexOption {
	label: string;
	value: IdentitySex;
}

/** 一条身份信息记录 */
export interface IdentityRecord {
	name: string;
	sex: string;
	email: string;
	phone: string;
	username: string;
	birthdate: string;
	zodiac: string;
	bio: string;
}
