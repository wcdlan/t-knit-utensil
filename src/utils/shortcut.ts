// 全局快捷键工具：平台检测、快捷键格式化与按键匹配
import type { ShortcutConfig } from '@/types/site';

export type { ShortcutConfig } from '@/types/site';

/** 判断当前是否为 macOS（用户代理包含 Macintosh / Mac OS X） */
export function isMacPlatform(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /Macintosh|Mac OS X/i.test(navigator.userAgent);
}

/** 判断当前是否为 iOS（iPhone / iPad，触摸设备上按键语义同 Mac） */
export function isIOSPlatform(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** 判断当前是否应使用 Command（⌘）修饰键（macOS 且配置开启替换） */
export function shouldUseCommand(config: ShortcutConfig): boolean {
	return (isMacPlatform() || isIOSPlatform()) && config.useCommandOnMac;
}

/** 将按键值转为可读展示：空格显示 Space、斜杠保持原样、其余大写 */
export function formatShortcutKey(key: string): string {
	if (key === ' ') return 'Space';
	if (key.length === 1) return key.toUpperCase();
	return key;
}

/** 生成快捷键的展示文本，如「Ctrl + /」或「⌘ + /」 */
export function formatShortcut(config: ShortcutConfig): string {
	const mod = shouldUseCommand(config) ? '⌘' : 'Ctrl';
	return `${mod} + ${formatShortcutKey(config.key)}`;
}

/**
 * 判断键盘事件是否匹配当前快捷键。
 * 修饰键按平台与配置解析：Mac 启用替换时用 metaKey（⌘），否则用 ctrlKey。
 */
export function matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
	if (!config.enabled) return false;
	const keyMatches = event.key.toLowerCase() === config.key.toLowerCase();
	if (!keyMatches) return false;
	// 与快捷键无关的修饰键（Alt / Shift）按下时不匹配，避免 Ctrl+Shift+/ 误触
	if (event.altKey || event.shiftKey) return false;
	return shouldUseCommand(config) ? event.metaKey : event.ctrlKey;
}
