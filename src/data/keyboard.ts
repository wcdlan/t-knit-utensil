// 键盘测试工具：Windows 与 macOS 两套完整键盘布局（纯静态数据，按物理区块组织）
import type { KeyboardLayoutDefinition, KeyboardLayoutOption, KeyboardRow } from '@/types/keyboard';

export type { KeyboardLayoutDefinition, KeyboardLayoutOption } from '@/types/keyboard';

/** 占位空隙统一宽度（不参与测试与高亮，仅用于对齐） */
const GAP = 1;

/** Windows 功能键行（Esc + F1-F12） */
const WIN_FUNCTION_ROW: KeyboardRow = {
	keys: [
		{ code: 'Escape', label: 'Esc' },
		{ code: 'gap-fn-1', label: '', width: GAP, spacer: true },
		{ code: 'F1', label: 'F1' },
		{ code: 'F2', label: 'F2' },
		{ code: 'F3', label: 'F3' },
		{ code: 'F4', label: 'F4' },
		{ code: 'gap-fn-2', label: '', width: 0.5, spacer: true },
		{ code: 'F5', label: 'F5' },
		{ code: 'F6', label: 'F6' },
		{ code: 'F7', label: 'F7' },
		{ code: 'F8', label: 'F8' },
		{ code: 'gap-fn-3', label: '', width: 0.5, spacer: true },
		{ code: 'F9', label: 'F9' },
		{ code: 'F10', label: 'F10' },
		{ code: 'F11', label: 'F11' },
		{ code: 'F12', label: 'F12' }
	]
};

/** macOS 功能键行（副标签为系统默认功能） */
const MAC_FUNCTION_ROW: KeyboardRow = {
	keys: [
		{ code: 'Escape', label: 'Esc' },
		{ code: 'gap-fn-1', label: '', width: GAP, spacer: true },
		{ code: 'F1', label: 'F1', subLabel: '☀−' },
		{ code: 'F2', label: 'F2', subLabel: '☀+' },
		{ code: 'F3', label: 'F3', subLabel: 'Mission' },
		{ code: 'F4', label: 'F4', subLabel: 'Search' },
		{ code: 'gap-fn-2', label: '', width: 0.5, spacer: true },
		{ code: 'F5', label: 'F5', subLabel: 'Dictate' },
		{ code: 'F6', label: 'F6', subLabel: 'DND' },
		{ code: 'F7', label: 'F7', subLabel: '⏮' },
		{ code: 'F8', label: 'F8', subLabel: '⏯' },
		{ code: 'gap-fn-3', label: '', width: 0.5, spacer: true },
		{ code: 'F9', label: 'F9', subLabel: '⏭' },
		{ code: 'F10', label: 'F10', subLabel: '🔇' },
		{ code: 'F11', label: 'F11', subLabel: '🔉' },
		{ code: 'F12', label: 'F12', subLabel: '🔊' }
	]
};

/** Windows 数字行 */
const WIN_NUMBER_ROW: KeyboardRow = {
	keys: [
		{ code: 'Backquote', label: '`', subLabel: '~' },
		{ code: 'Digit1', label: '1', subLabel: '!' },
		{ code: 'Digit2', label: '2', subLabel: '@' },
		{ code: 'Digit3', label: '3', subLabel: '#' },
		{ code: 'Digit4', label: '4', subLabel: '$' },
		{ code: 'Digit5', label: '5', subLabel: '%' },
		{ code: 'Digit6', label: '6', subLabel: '^' },
		{ code: 'Digit7', label: '7', subLabel: '&' },
		{ code: 'Digit8', label: '8', subLabel: '*' },
		{ code: 'Digit9', label: '9', subLabel: '(' },
		{ code: 'Digit0', label: '0', subLabel: ')' },
		{ code: 'Minus', label: '-', subLabel: '_' },
		{ code: 'Equal', label: '=', subLabel: '+' },
		{ code: 'Backspace', label: 'Backspace', subLabel: '⌫', width: 2 }
	]
};

/** macOS 数字行（Backspace 在 Apple 键盘上标注为 Delete ⌫） */
const MAC_NUMBER_ROW: KeyboardRow = {
	keys: [
		{ code: 'Backquote', label: '`', subLabel: '~' },
		{ code: 'Digit1', label: '1', subLabel: '!' },
		{ code: 'Digit2', label: '2', subLabel: '@' },
		{ code: 'Digit3', label: '3', subLabel: '#' },
		{ code: 'Digit4', label: '4', subLabel: '$' },
		{ code: 'Digit5', label: '5', subLabel: '%' },
		{ code: 'Digit6', label: '6', subLabel: '^' },
		{ code: 'Digit7', label: '7', subLabel: '&' },
		{ code: 'Digit8', label: '8', subLabel: '*' },
		{ code: 'Digit9', label: '9', subLabel: '(' },
		{ code: 'Digit0', label: '0', subLabel: ')' },
		{ code: 'Minus', label: '-', subLabel: '_' },
		{ code: 'Equal', label: '=', subLabel: '+' },
		{ code: 'Backspace', label: 'Delete', subLabel: '⌫', width: 2 }
	]
};

/** Tab 行（QWERTY） */
const TAB_ROW: KeyboardRow = {
	keys: [
		{ code: 'Tab', label: 'Tab', width: 1.5 },
		{ code: 'KeyQ', label: 'Q' },
		{ code: 'KeyW', label: 'W' },
		{ code: 'KeyE', label: 'E' },
		{ code: 'KeyR', label: 'R' },
		{ code: 'KeyT', label: 'T' },
		{ code: 'KeyY', label: 'Y' },
		{ code: 'KeyU', label: 'U' },
		{ code: 'KeyI', label: 'I' },
		{ code: 'KeyO', label: 'O' },
		{ code: 'KeyP', label: 'P' },
		{ code: 'BracketLeft', label: '[', subLabel: '{' },
		{ code: 'BracketRight', label: ']', subLabel: '}' },
		{ code: 'Backslash', label: '\\', subLabel: '|', width: 1.5 }
	]
};

/** Windows CapsLock 行（ASDF） */
const WIN_CAPS_ROW: KeyboardRow = {
	keys: [
		{ code: 'CapsLock', label: 'Caps', width: 1.75 },
		{ code: 'KeyA', label: 'A' },
		{ code: 'KeyS', label: 'S' },
		{ code: 'KeyD', label: 'D' },
		{ code: 'KeyF', label: 'F' },
		{ code: 'KeyG', label: 'G' },
		{ code: 'KeyH', label: 'H' },
		{ code: 'KeyJ', label: 'J' },
		{ code: 'KeyK', label: 'K' },
		{ code: 'KeyL', label: 'L' },
		{ code: 'Semicolon', label: ';', subLabel: ':' },
		{ code: 'Quote', label: "'", subLabel: '"' },
		{ code: 'Enter', label: 'Enter', width: 2.25 }
	]
};

/** macOS CapsLock 行（回车键在 Apple 键盘上标注为 Return） */
const MAC_CAPS_ROW: KeyboardRow = {
	keys: [
		{ code: 'CapsLock', label: 'Caps', width: 1.75 },
		{ code: 'KeyA', label: 'A' },
		{ code: 'KeyS', label: 'S' },
		{ code: 'KeyD', label: 'D' },
		{ code: 'KeyF', label: 'F' },
		{ code: 'KeyG', label: 'G' },
		{ code: 'KeyH', label: 'H' },
		{ code: 'KeyJ', label: 'J' },
		{ code: 'KeyK', label: 'K' },
		{ code: 'KeyL', label: 'L' },
		{ code: 'Semicolon', label: ';', subLabel: ':' },
		{ code: 'Quote', label: "'", subLabel: '"' },
		{ code: 'Enter', label: 'Return', width: 2.25 }
	]
};

/** Shift 行（ZXCV） */
const SHIFT_ROW: KeyboardRow = {
	keys: [
		{ code: 'ShiftLeft', label: 'Shift', modifier: true, width: 2.25 },
		{ code: 'KeyZ', label: 'Z' },
		{ code: 'KeyX', label: 'X' },
		{ code: 'KeyC', label: 'C' },
		{ code: 'KeyV', label: 'V' },
		{ code: 'KeyB', label: 'B' },
		{ code: 'KeyN', label: 'N' },
		{ code: 'KeyM', label: 'M' },
		{ code: 'Comma', label: ',', subLabel: '<' },
		{ code: 'Period', label: '.', subLabel: '>' },
		{ code: 'Slash', label: '/', subLabel: '?' },
		{ code: 'ShiftRight', label: 'Shift', modifier: true, width: 2.75 }
	]
};

/** Windows 修饰键行：Ctrl / Win / Alt + Space */
const WIN_MODIFIER_ROW: KeyboardRow = {
	keys: [
		{ code: 'ControlLeft', label: 'Ctrl', modifier: true, width: 1.25 },
		{ code: 'MetaLeft', label: 'Win', modifier: true, width: 1.25 },
		{ code: 'AltLeft', label: 'Alt', modifier: true, width: 1.25 },
		{ code: 'Space', label: 'Space', width: 6.25 },
		{ code: 'AltRight', label: 'Alt', modifier: true, width: 1.25 },
		{ code: 'MetaRight', label: 'Win', modifier: true, width: 1.25 },
		{ code: 'ContextMenu', label: 'Menu', width: 1.25 },
		{ code: 'ControlRight', label: 'Ctrl', modifier: true, width: 1.25 }
	]
};

/** macOS 修饰键行：fn / control / option / command + Space */
const MAC_MODIFIER_ROW: KeyboardRow = {
	keys: [
		{ code: 'Fn', label: 'fn', modifier: true, width: 1 },
		{ code: 'ControlLeft', label: 'control', modifier: true, width: 1.25 },
		{ code: 'AltLeft', label: 'option', modifier: true, width: 1.25 },
		{ code: 'MetaLeft', label: 'command', modifier: true, width: 1.5 },
		{ code: 'Space', label: 'Space', width: 6 },
		{ code: 'MetaRight', label: 'command', modifier: true, width: 1.5 },
		{ code: 'AltRight', label: 'option', modifier: true, width: 1.25 }
	]
};

/** 编辑键区（两布局一致） */
const NAV_ROWS: KeyboardRow[] = [
	{
		keys: [
			{ code: 'PrintScreen', label: 'PrtSc' },
			{ code: 'ScrollLock', label: 'ScrLk' },
			{ code: 'Pause', label: 'Pause' }
		]
	},
	{
		keys: [
			{ code: 'Insert', label: 'Ins' },
			{ code: 'Home', label: 'Home' },
			{ code: 'PageUp', label: 'PgUp' }
		]
	},
	{
		keys: [
			{ code: 'Delete', label: 'Del' },
			{ code: 'End', label: 'End' },
			{ code: 'PageDown', label: 'PgDn' }
		]
	}
];

/** 方向键区（倒 T 形，两布局一致） */
const ARROW_ROWS: KeyboardRow[] = [
	{
		keys: [
			{ code: 'gap-arrow-1', label: '', width: GAP, spacer: true },
			{ code: 'ArrowUp', label: '↑' },
			{ code: 'gap-arrow-2', label: '', width: GAP, spacer: true }
		]
	},
	{
		keys: [
			{ code: 'ArrowLeft', label: '←' },
			{ code: 'ArrowDown', label: '↓' },
			{ code: 'ArrowRight', label: '→' }
		]
	}
];

/** 数字小键盘区（+ 与 Enter 跨行，用空隙占位对齐，两布局一致） */
const NUMPAD_ROWS: KeyboardRow[] = [
	{
		keys: [
			{ code: 'NumLock', label: 'Num' },
			{ code: 'NumpadDivide', label: '/' },
			{ code: 'NumpadMultiply', label: '*' },
			{ code: 'NumpadSubtract', label: '-' }
		]
	},
	{
		keys: [
			{ code: 'Numpad7', label: '7' },
			{ code: 'Numpad8', label: '8' },
			{ code: 'Numpad9', label: '9' },
			{ code: 'NumpadAdd', label: '+' }
		]
	},
	{
		keys: [
			{ code: 'Numpad4', label: '4' },
			{ code: 'Numpad5', label: '5' },
			{ code: 'Numpad6', label: '6' },
			{ code: 'gap-numpad-1', label: '', width: GAP, spacer: true }
		]
	},
	{
		keys: [
			{ code: 'Numpad1', label: '1' },
			{ code: 'Numpad2', label: '2' },
			{ code: 'Numpad3', label: '3' },
			{ code: 'NumpadEnter', label: 'Enter' }
		]
	},
	{
		keys: [
			{ code: 'Numpad0', label: '0', width: 2 },
			{ code: 'NumpadDecimal', label: '.' },
			{ code: 'gap-numpad-2', label: '', width: GAP, spacer: true }
		]
	}
];

/** Windows 布局 */
export const WIN_LAYOUT: KeyboardLayoutDefinition = {
	id: 'win',
	name: 'Windows',
	description: '标准 104 键布局：Ctrl / Win / Alt 修饰键，含数字小键盘',
	functionRow: WIN_FUNCTION_ROW,
	mainRows: [WIN_NUMBER_ROW, TAB_ROW, WIN_CAPS_ROW, SHIFT_ROW, WIN_MODIFIER_ROW],
	navRows: NAV_ROWS,
	arrowRows: ARROW_ROWS,
	numpadRows: NUMPAD_ROWS
};

/** macOS 布局 */
export const MAC_LAYOUT: KeyboardLayoutDefinition = {
	id: 'mac',
	name: 'macOS',
	description: 'Apple 布局：fn / control / option / command 修饰键，Return 回车',
	functionRow: MAC_FUNCTION_ROW,
	mainRows: [MAC_NUMBER_ROW, TAB_ROW, MAC_CAPS_ROW, SHIFT_ROW, MAC_MODIFIER_ROW],
	navRows: NAV_ROWS,
	arrowRows: ARROW_ROWS,
	numpadRows: NUMPAD_ROWS
};

/** 全部可选布局 */
export const KEYBOARD_LAYOUTS: KeyboardLayoutDefinition[] = [WIN_LAYOUT, MAC_LAYOUT];

/** 布局切换选项 */
export const KEYBOARD_LAYOUT_OPTIONS: KeyboardLayoutOption[] = [
	{ label: 'Windows', value: 'win', description: 'Ctrl / Win / Alt 修饰键' },
	{ label: 'macOS', value: 'mac', description: 'control / option / command 修饰键' }
];
