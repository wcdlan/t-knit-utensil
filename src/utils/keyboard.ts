// 键盘测试工具：键位信息解析、组合键格式化、APM 计算与默认布局检测
import { isMacPlatform } from '@/utils/shortcut';
import type { KeyboardLayout, KeyboardLayoutDefinition, KeyboardRow } from '@/types/keyboard';

export type { KeyboardLayout } from '@/types/keyboard';

/**
 * 传统 keyCode 静态映射（浏览器已废弃 event.keyCode，这里由 event.code 静态推导，不读取废弃属性）。
 * 未收录的键位返回 0。
 */
const LEGACY_KEY_CODES: Record<string, number> = {
	Backspace: 8,
	Tab: 9,
	Enter: 13,
	NumpadEnter: 13,
	ShiftLeft: 16,
	ShiftRight: 16,
	ControlLeft: 17,
	ControlRight: 17,
	AltLeft: 18,
	AltRight: 18,
	Pause: 19,
	CapsLock: 20,
	Escape: 27,
	Space: 32,
	PageUp: 33,
	PageDown: 34,
	End: 35,
	Home: 36,
	ArrowLeft: 37,
	ArrowUp: 38,
	ArrowRight: 39,
	ArrowDown: 40,
	PrintScreen: 44,
	Insert: 45,
	Delete: 46,
	MetaLeft: 91,
	MetaRight: 92,
	ContextMenu: 93,
	Numpad0: 96,
	Numpad1: 97,
	Numpad2: 98,
	Numpad3: 99,
	Numpad4: 100,
	Numpad5: 101,
	Numpad6: 102,
	Numpad7: 103,
	Numpad8: 104,
	Numpad9: 105,
	NumpadMultiply: 106,
	NumpadAdd: 107,
	NumpadSubtract: 109,
	NumpadDecimal: 110,
	NumpadDivide: 111,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	NumLock: 144,
	ScrollLock: 145,
	Semicolon: 186,
	Equal: 187,
	Comma: 188,
	Minus: 189,
	Period: 190,
	Slash: 191,
	Backquote: 192,
	BracketLeft: 219,
	Backslash: 220,
	BracketRight: 221,
	Quote: 222,
	IntlBackslash: 226
};

/** 字母键 KeyA-KeyZ 的 keyCode（65-90）由规则推导 */
function letterKeyCode(code: string): number {
	const letter = /^Key([A-Z])$/.exec(code);
	return letter ? letter[1].charCodeAt(0) : 0;
}

/** 数字键 Digit0-Digit9 的 keyCode（48-57）由规则推导 */
function digitKeyCode(code: string): number {
	const digit = /^Digit(\d)$/.exec(code);
	return digit ? 48 + Number(digit[1]) : 0;
}

/** 由物理键位 code 推导传统 keyCode（浏览器已废弃该属性，仅作为兼容信息展示） */
export function keyCodeOf(code: string): number {
	if (LEGACY_KEY_CODES[code] !== undefined) return LEGACY_KEY_CODES[code];
	return letterKeyCode(code) || digitKeyCode(code);
}

/** 键位所在区域说明 */
export function locationOf(code: string): string {
	if (/^Numpad/.test(code) || code === 'NumLock') return '数字小键盘';
	// 方向键需优先于修饰键后缀规则判断，避免 ArrowLeft / ArrowRight 被误判为左侧/右侧修饰键
	if (/^Arrow/.test(code)) return '方向键区';
	if (/^F\d+$/.test(code) || code === 'Escape') return '功能键区';
	if (['Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'PrintScreen', 'ScrollLock', 'Pause'].includes(code)) {
		return '编辑键区';
	}
	if (/Left$/.test(code)) return '左侧修饰键';
	if (/Right$/.test(code)) return '右侧修饰键';
	if (code === 'Space') return '空格键';
	return '标准键区';
}

/** 是否为修饰键 code */
export function isModifierCode(code: string): boolean {
	return /^(Control|Shift|Alt|Meta)(Left|Right)$/.test(code) || code === 'Fn' || code === 'CapsLock';
}

/** 特殊键位的展示名称（字母数字键由 code 直接推导） */
const SPECIAL_LABELS: Record<string, string> = {
	Escape: 'Esc',
	Backspace: 'Backspace',
	Tab: 'Tab',
	CapsLock: 'Caps',
	Enter: 'Enter',
	NumpadEnter: 'Num Enter',
	Space: 'Space',
	Backquote: '`',
	Minus: '-',
	Equal: '=',
	BracketLeft: '[',
	BracketRight: ']',
	Backslash: '\\',
	Semicolon: ';',
	Quote: "'",
	Comma: ',',
	Period: '.',
	Slash: '/',
	ArrowUp: '↑',
	ArrowDown: '↓',
	ArrowLeft: '←',
	ArrowRight: '→',
	Insert: 'Ins',
	Delete: 'Del',
	Home: 'Home',
	End: 'End',
	PageUp: 'PgUp',
	PageDown: 'PgDn',
	PrintScreen: 'PrtSc',
	ScrollLock: 'ScrLk',
	Pause: 'Pause',
	NumLock: 'Num',
	NumpadDivide: 'Num /',
	NumpadMultiply: 'Num *',
	NumpadSubtract: 'Num -',
	NumpadAdd: 'Num +',
	NumpadDecimal: 'Num .'
};

/** 由物理键位 code 取展示名称 */
export function keyLabelOf(code: string): string {
	if (SPECIAL_LABELS[code] !== undefined) return SPECIAL_LABELS[code];
	const letter = /^Key([A-Z])$/.exec(code);
	if (letter) return letter[1];
	const digit = /^Digit(\d)$/.exec(code);
	if (digit) return digit[1];
	const numpad = /^Numpad(\d)$/.exec(code);
	if (numpad) return 'Num ' + numpad[1];
	return code;
}

/**
 * 组合键展示文本：按「修饰键 → 主键」顺序拼接。
 * 修饰键标签按布局区分（Windows 用 Ctrl/Win/Alt，macOS 用 ⌃/⌥/⌘）。
 */
export function formatCombo(codes: string[], layout: KeyboardLayout): string {
	const modifierLabels: Record<string, string> = {
		ControlLeft: layout === 'mac' ? '⌃' : 'Ctrl',
		ControlRight: layout === 'mac' ? '⌃' : 'Ctrl',
		AltLeft: layout === 'mac' ? '⌥' : 'Alt',
		AltRight: layout === 'mac' ? '⌥' : 'Alt',
		MetaLeft: layout === 'mac' ? '⌘' : 'Win',
		MetaRight: layout === 'mac' ? '⌘' : 'Win',
		ShiftLeft: layout === 'mac' ? '⇧' : 'Shift',
		ShiftRight: layout === 'mac' ? '⇧' : 'Shift',
		Fn: 'fn',
		CapsLock: layout === 'mac' ? '⇪' : 'Caps'
	};
	// 修饰键按平台习惯排序：Windows 为 Ctrl → Win → Alt → Shift，macOS 为 ⌃ → ⌥ → ⌘ → ⇧；主键保持按下顺序
	const order =
		layout === 'mac'
			? [
					'ControlLeft',
					'ControlRight',
					'AltLeft',
					'AltRight',
					'MetaLeft',
					'MetaRight',
					'ShiftLeft',
					'ShiftRight',
					'Fn',
					'CapsLock'
				]
			: [
					'ControlLeft',
					'ControlRight',
					'MetaLeft',
					'MetaRight',
					'AltLeft',
					'AltRight',
					'ShiftLeft',
					'ShiftRight',
					'Fn',
					'CapsLock'
				];
	const modifiers = order.filter((code) => codes.includes(code)).map((code) => modifierLabels[code]);
	const mains = codes.filter((code) => !order.includes(code)).map(keyLabelOf);
	return [...modifiers, ...mains].join(' + ');
}

/** 根据当前环境推断默认布局：macOS / iOS 用 mac，其余用 win */
export function detectDefaultLayout(): KeyboardLayout {
	return isMacPlatform() ? 'mac' : 'win';
}

/** 统计一套布局中可测试的键位总数（排除占位空隙） */
export function countLayoutKeys(layout: KeyboardLayoutDefinition): number {
	const rows: KeyboardRow[] = [
		layout.functionRow,
		...layout.mainRows,
		...layout.navRows,
		...layout.arrowRows,
		...layout.numpadRows
	];
	return rows.reduce((sum, row) => sum + row.keys.filter((key) => !key.spacer).length, 0);
}

/**
 * 是否需要拦截浏览器默认行为。
 * 常规按键（Tab 切焦点、Space 滚动、/ 快速查找等）一律拦截，保证测试纯净；
 * 但放行刷新、开发者工具等关键浏览器快捷键，避免用户被“困”在页面里。
 */
export function shouldPreventDefault(event: KeyboardEvent): boolean {
	const passThroughCodes = ['F5', 'F11', 'F12'];
	if (passThroughCodes.includes(event.code)) return false;
	// Ctrl/Cmd + R（刷新）、+ Shift + I/J/C（开发者工具）、+ W/T/N（窗口与标签页）
	const withPrimary = event.ctrlKey || event.metaKey;
	if (withPrimary && event.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(event.code)) return false;
	if (withPrimary && ['KeyR', 'KeyW', 'KeyT', 'KeyN'].includes(event.code)) return false;
	return true;
}

/**
 * 计算 APM（每分钟按键数）：
 * 统计窗口内按键数（最长 60 秒），不足 60 秒按实际时长折算，停止输入后随窗口滑动自然衰减。
 */
export function calcApm(timestamps: number[], now: number, startedAt: number): number {
	const windowMs = 60000;
	const from = Math.max(startedAt, now - windowMs);
	if (now <= from) return 0;
	const count = timestamps.filter((t) => t >= from).length;
	return Math.round((count / (now - from)) * windowMs);
}

/** 毫秒时长格式化为 mm:ss */
export function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** 时刻格式化为 HH:mm:ss */
export function formatClockTime(date: Date): string {
	return [date.getHours(), date.getMinutes(), date.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}
