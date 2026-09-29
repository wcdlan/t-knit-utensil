// 端口工具相关类型（随机端口生成 / 常用服务默认端口速查）

/** 端口区间预设键 */
export type PortRangeKey = 'dynamic' | 'registered' | 'all' | 'system' | 'custom';

/** 端口区间预设 */
export interface PortRangePreset {
	/** 预设键 */
	key: PortRangeKey;
	/** 展示名称 */
	label: string;
	/** 区间起始端口（含） */
	min: number;
	/** 区间结束端口（含） */
	max: number;
	/** 区间说明 */
	description: string;
}

/** 随机端口生成配置 */
export interface RandomPortOptions {
	/** 生成数量 */
	count: number;
	/** 起始端口（含） */
	min: number;
	/** 结束端口（含） */
	max: number;
	/** 是否排除系统端口（1-1023） */
	excludeSystem: boolean;
	/** 是否排除常用服务默认端口 */
	excludeCommon: boolean;
}

/** 单个随机端口条目 */
export interface RandomPortEntry {
	/** 端口号 */
	port: number;
	/** 所属区间名称（系统端口 / 注册端口 / 动态端口） */
	rangeName: string;
	/** 命中的常用服务名（未命中为 null） */
	service: string | null;
}

/** 随机端口生成结果 */
export interface RandomPortResult {
	/** 生成的端口条目（按端口号升序） */
	entries: RandomPortEntry[];
	/** 剔除排除项后的候选端口总数 */
	poolSize: number;
	/** 请求数量超过候选数量时为 true（结果会少于请求条数） */
	insufficient: boolean;
}

/** 传输层协议 */
export type PortProtocol = 'TCP' | 'UDP' | 'TCP/UDP';

/** 常用服务默认端口条目 */
export interface CommonPortEntry {
	/** 服务标识（英文名，如 Redis） */
	service: string;
	/** 服务中文名 */
	name: string;
	/** 默认端口号 */
	port: number;
	/** 传输层协议 */
	protocol: PortProtocol;
	/** 服务介绍 */
	description: string;
	/** 使用与安全提示 */
	note?: string;
	/** 是否高频使用（用于「常用」标记） */
	hot?: boolean;
}

/** 常用服务默认端口分组 */
export interface CommonPortGroup {
	/** 分组键 */
	key: string;
	/** 分组名称 */
	label: string;
	/** 分组说明 */
	description: string;
	/** 分组内的服务条目 */
	entries: CommonPortEntry[];
}
