// IP 网络工具相关类型（IPv4 解析 / IPv6 解析 / 子网计算）

/** IPv4 解析结果 */
export interface Ipv4ParseResult {
	/** 地址（点分十进制，去掉前缀） */
	ip: string;
	/** 前缀长度 0-32 */
	prefix: number;
	/** 子网掩码（点分十进制） */
	mask: string;
	/** 子网掩码二进制表示 */
	maskBinary: string;
	/** 网络地址 */
	network: string;
	/** 广播地址 */
	broadcast: string;
	/** 首可用主机地址 */
	firstHost: string;
	/** 末可用主机地址 */
	lastHost: string;
	/** 总地址数 */
	totalHosts: string;
	/** 可用主机数 */
	usableHosts: string;
	/** 通配符掩码 */
	wildcard: string;
	/** IP 二进制表示 */
	binary: string;
	/** IP 十六进制表示 */
	hex: string;
	/** IP 十进制整数 */
	int: string;
	/** 反向 DNS 记录 */
	reverse: string;
	/** 地址类别（A-E） */
	ipClass: string;
	/** 是否私有地址 */
	isPrivate: boolean;
	/** 是否环回地址 */
	isLoopback: boolean;
	/** 是否组播地址 */
	isMulticast: boolean;
	/** 是否链路本地地址 */
	isLinkLocal: boolean;
	/** 是否保留地址 */
	isReserved: boolean;
}

/** IPv6 解析结果 */
export interface Ipv6ParseResult {
	/** 地址（去前缀） */
	ip: string;
	/** 前缀长度 0-128 */
	prefix: number;
	/** 完整展开形式（8 组） */
	expanded: string;
	/** 压缩形式 */
	compressed: string;
	/** 网络地址（展开形式） */
	network: string;
	/** 前缀掩码（展开形式） */
	mask: string;
	/** 前缀掩码（压缩形式） */
	maskCompressed: string;
	/** 接口标识符（低 64 位） */
	interfaceId: string;
	/** 反向 DNS 记录 */
	reverse: string;
	/** 总地址数 */
	totalHosts: string;
	/** IPv4 映射地址（如有） */
	ipv4Mapped: string | null;
	/** 是否未指定地址 :: */
	isUnspecified: boolean;
	/** 是否环回地址 ::1 */
	isLoopback: boolean;
	/** 是否链路本地 fe80::/10 */
	isLinkLocal: boolean;
	/** 是否组播 ff00::/8 */
	isMulticast: boolean;
	/** 是否唯一本地 fc00::/7 */
	isUniqueLocal: boolean;
	/** 是否全局单播 */
	isGlobalUnicast: boolean;
	/** 是否 IPv4 映射地址 */
	isIpv4Mapped: boolean;
	/** 是否文档示例地址 2001:db8::/32 */
	isDocumentation: boolean;
}

/** 单个子网条目 */
export interface SubnetEntry {
	/** 序号 */
	index: number;
	/** 网络地址（CIDR 表示） */
	network: string;
	/** 地址范围（首地址 - 末地址） */
	range: string;
	/** 可用主机数 / 总地址数 */
	hosts: string;
	/** 广播地址（仅 IPv4，IPv6 无此概念） */
	broadcast: string | null;
}

/** IPv4 子网计算结果 */
export interface Ipv4SubnetCalcResult {
	version: 4;
	/** 地址（点分十进制） */
	ip: string;
	/** 前缀长度 */
	prefix: number;
	/** 划分目标前缀 */
	targetPrefix: number;
	/** 子网掩码 */
	mask: string;
	/** 子网掩码二进制 */
	maskBinary: string;
	/** 通配符掩码 */
	wildcard: string;
	/** 网络地址 */
	network: string;
	/** 广播地址 */
	broadcast: string;
	/** 首可用主机 */
	firstHost: string;
	/** 末可用主机 */
	lastHost: string;
	/** 总地址数 */
	totalHosts: string;
	/** 可用主机数 */
	usableHosts: string;
	/** 网络地址二进制 */
	binary: string;
	/** 反向 DNS */
	reverse: string;
	/** 子网数量 */
	subnetCount: number;
	/** 子网列表是否因数量过多被截断 */
	truncated: boolean;
	/** 划分出的子网列表（截断时只含前若干条） */
	subnets: SubnetEntry[];
}

/** IPv6 子网计算结果 */
export interface Ipv6SubnetCalcResult {
	version: 6;
	/** 地址 */
	ip: string;
	/** 前缀长度 */
	prefix: number;
	/** 划分目标前缀 */
	targetPrefix: number;
	/** 完整展开形式 */
	expanded: string;
	/** 压缩形式 */
	compressed: string;
	/** 网络地址 */
	network: string;
	/** 前缀掩码 */
	mask: string;
	/** 接口标识符 */
	interfaceId: string;
	/** 总地址数 */
	totalHosts: string;
	/** 子网数量（可能超出安全整数范围，用字符串） */
	subnetCount: string;
	/** 子网列表是否因数量过多被截断 */
	truncated: boolean;
	/** 划分出的子网列表（截断时只含前若干条） */
	subnets: SubnetEntry[];
}

/** 子网计算结果（IPv4 / IPv6 联合） */
export type SubnetCalcResult = Ipv4SubnetCalcResult | Ipv6SubnetCalcResult;
