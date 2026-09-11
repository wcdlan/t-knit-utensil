// 键盘测试工具相关类型

/** 键盘布局类型：Windows 与 macOS */
export type KeyboardLayout = 'win' | 'mac';

/** 单个键位定义（对应物理键 KeyboardEvent.code） */
export interface KeyboardKey {
	/** 物理键位标识（KeyboardEvent.code），如 KeyA / Digit1；占位空隙为虚拟值 */
	code: string;
	/** 键帽主标签 */
	label: string;
	/** 键帽副标签（数字键的 Shift 字符 / Mac 功能键说明） */
	subLabel?: string;
	/** 键宽（以 1u 为基准，默认 1） */
	width?: number;
	/** 是否为修饰键（Ctrl / Shift / Alt / Meta） */
	modifier?: boolean;
	/** 是否为占位空隙：不参与测试与高亮 */
	spacer?: boolean;
}

/** 一行键位 */
export interface KeyboardRow {
	keys: KeyboardKey[];
}

/** 一套完整键盘布局（按物理区块组织） */
export interface KeyboardLayoutDefinition {
	id: KeyboardLayout;
	/** 布局名称，如 Windows */
	name: string;
	/** 布局说明 */
	description: string;
	/** 功能键行（Esc + F1-F12） */
	functionRow: KeyboardRow;
	/** 主键盘区行列表 */
	mainRows: KeyboardRow[];
	/** 编辑键区（PrtSc / Ins / Del 等 3 列） */
	navRows: KeyboardRow[];
	/** 方向键区 */
	arrowRows: KeyboardRow[];
	/** 数字小键盘区 */
	numpadRows: KeyboardRow[];
}

/** 布局切换选项 */
export interface KeyboardLayoutOption {
	label: string;
	value: KeyboardLayout;
	description: string;
}

/** 生效中的按键信息（实时面板展示） */
export interface LiveKeyInfo {
	/** event.key（字符值） */
	key: string;
	/** event.code（物理键位） */
	code: string;
	/** 传统 keyCode（兼容旧系统，浏览器已废弃） */
	keyCode: number;
	/** 键位区域（标准区 / 数字小键盘 / 左侧修饰键等） */
	location: string;
	/** 组合键描述，如 Ctrl + Shift + A */
	combo: string;
	/** 当前按下的修饰键列表 */
	modifiers: string[];
}

/** 输入历史中的一条按键记录 */
export interface KeyHistoryEntry {
	/** 自增序号（用于列表 key） */
	id: number;
	/** event.key */
	key: string;
	/** event.code */
	code: string;
	/** 传统 keyCode */
	keyCode: number;
	/** 组合键描述 */
	combo: string;
	/** 是否为长按重复触发 */
	repeat: boolean;
	/** 触发时刻（HH:mm:ss） */
	time: string;
}

/** 按键统计 */
export interface KeyboardStats {
	/** 总按键次数（不含长按重复） */
	total: number;
	/** 已测试的不同键位数 */
	unique: number;
	/** 当前布局可测试的键位总数 */
	keysTotal: number;
	/** 最近一分钟按键数（APM） */
	apm: number;
	/** APM 峰值 */
	peakApm: number;
	/** 测试时长（毫秒） */
	elapsed: number;
}
