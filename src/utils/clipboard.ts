import { createDiscreteApi, dateZhCN, zhCN } from 'naive-ui';
import { themeOverrides } from '@/assets/theme';

const { message } = createDiscreteApi(['message'], {
	configProviderProps: { themeOverrides, locale: zhCN, dateLocale: dateZhCN }
});

export async function copyToClipboard(text: string, successText?: string): Promise<void> {
	const displayText = successText ?? '复制成功';
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);
	}
	message.success(displayText);
}
