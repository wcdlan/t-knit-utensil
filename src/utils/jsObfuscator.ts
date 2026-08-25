import type { ObfuscationResult, ObfuscatorOptions } from '@/types/jsObfuscator';

/** javascript-obfuscator 模块形态（dev 预构建仅暴露 default，生产构建暴露命名导出） */
type ObfuscatorFacade = typeof import('javascript-obfuscator');

/** 动态加载 javascript-obfuscator（浏览器版 bundle），避免首屏体积膨胀 */
let obfuscatorModulePromise: Promise<ObfuscatorFacade> | null = null;

function loadObfuscator(): Promise<ObfuscatorFacade> {
	if (!obfuscatorModulePromise) {
		obfuscatorModulePromise = import('javascript-obfuscator').then((mod) => {
			// dev 预构建把整个命名空间挂在 default 上，生产构建直接暴露命名导出，两种形态都兼容
			const facade = (mod as unknown as { obfuscate?: unknown }).obfuscate
				? (mod as unknown as ObfuscatorFacade)
				: ((mod as unknown as { default?: ObfuscatorFacade }).default ?? (mod as unknown as ObfuscatorFacade));
			return facade;
		});
	}
	return obfuscatorModulePromise;
}

/**
 * 混淆 JavaScript 代码
 * @param sourceCode 源代码
 * @param options 混淆选项
 * @returns 混淆结果（代码 + 耗时）
 */
export async function obfuscateCode(sourceCode: string, options: ObfuscatorOptions): Promise<ObfuscationResult> {
	const facade = await loadObfuscator();
	const start = performance.now();
	const result = facade.obfuscate(sourceCode, options);
	const durationMs = performance.now() - start;
	return { code: result.getObfuscatedCode(), durationMs };
}
