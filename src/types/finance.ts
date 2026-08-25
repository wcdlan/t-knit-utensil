// Faker 金融数据生成工具相关类型

/** 单条金融记录（户名、账号、金额、信用卡、IBAN、BIC、交易描述） */
export interface FinanceRecord {
	accountName: string;
	accountNumber: string;
	amount: string;
	creditCard: string;
	issuer: string;
	cvv: string;
	iban: string;
	bic: string;
	transaction: string;
}
