import iconv from 'iconv-lite';
import type { EncodingOption } from '@/types/encoding';

export type { EncodingOption };

export const SUPPORTED_ENCODINGS = [
	{ value: 'utf8', label: 'UTF-8' },
	{ value: 'gbk', label: 'GBK' },
	{ value: 'gb2312', label: 'GB2312' },
	{ value: 'gb18030', label: 'GB18030' },
	{ value: 'big5', label: 'Big5 (繁体中文)' },
	{ value: 'shift_jis', label: 'Shift-JIS (日文)' },
	{ value: 'euc-jp', label: 'EUC-JP (日文)' },
	{ value: 'euc-kr', label: 'EUC-KR (韩文)' },
	{ value: 'iso-8859-1', label: 'ISO-8859-1 (Latin-1)' },
	{ value: 'windows-1252', label: 'Windows-1252 (西欧)' },
	{ value: 'windows-1251', label: 'Windows-1251 (西里尔)' },
	{ value: 'koi8-r', label: 'KOI8-R (俄文)' }
];

/**
 * 将文本按源编码编码为字节，再按目标编码解码为文本。
 * 当源编码与目标编码不同时，可模拟"乱码"效果。
 */
export function convertEncoding(input: string, sourceEncoding: string, targetEncoding: string): string {
	const bytes = iconv.encode(input, sourceEncoding);
	return iconv.decode(bytes, targetEncoding);
}
