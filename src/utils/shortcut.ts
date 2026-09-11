// 全局快捷键工具：平台检测、快捷键格式化与按键匹配
import type { ShortcutConfig, ShortcutFeature } from '@/types/site';

export type { ShortcutConfig, ShortcutFeature } from '@/types/site';

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

/** 生成单个绑定的展示文本，如「Ctrl + /」或「⌘ + /」 */
export function formatBinding(config: ShortcutConfig, key: string): string {
	const mod = shouldUseCommand(config) ? '⌘' : 'Ctrl';
	return `${mod} + ${formatShortcutKey(key)}`;
}

/** 生成某个功能全部快捷键的展示文本，如「Ctrl + /、Ctrl + \」 */
export function formatFeatureShortcuts(config: ShortcutConfig, featureId: string): string {
	const feature = config.features.find((f) => f.id === featureId);
	if (!feature || feature.keys.length === 0) return '';
	return feature.keys.map((key) => formatBinding(config, key)).join('、');
}

/** 按功能 id 查找配置项 */
export function findShortcutFeature(config: ShortcutConfig, featureId: string): ShortcutFeature | undefined {
	return config.features.find((f) => f.id === featureId);
}

/**
 * 判断键盘事件命中了哪个功能的快捷键（未命中返回 null）。
 * 一个功能可绑定多个触发键，任一匹配即视为命中；修饰键按平台与配置解析。
 */
export function matchShortcutFeature(event: KeyboardEvent, config: ShortcutConfig): string | null {
	if (!config.enabled) return null;
	// 与快捷键无关的修饰键（Alt / Shift）按下时不匹配，避免 Ctrl+Shift+/ 误触
	if (event.altKey || event.shiftKey) return null;
	const modMatches = shouldUseCommand(config) ? event.metaKey : event.ctrlKey;
	if (!modMatches) return null;
	const pressedKey = event.key.toLowerCase();
	const feature = config.features.find((f) => f.keys.some((k) => k.toLowerCase() === pressedKey));
	return feature ? feature.id : null;
}
