// Faker 网络数据生成工具相关类型

/** 单条网络记录（域名、邮箱、IP、MAC、端口、状态码、浏览器 UA） */
export interface NetworkRecord {
	domain: string;
	email: string;
	ipv4: string;
	ipv6: string;
	mac: string;
	userAgent: string;
	port: number;
	statusCode: number;
}
