// 变量名格式转换：任意格式输入拆分单词、检测格式、转换为其他常用格式
import type { CaseFormat, CaseFormatId } from '@/types/case';

export type { CaseFormat, CaseFormatId } from '@/types/case';

/** 单词转小写 */
function toLower(word: string): string {
	return word.toLowerCase();
}

/** 单词转大写 */
function toUpper(word: string): string {
	return word.toUpperCase();
}

/** 单词转首字母大写（其余小写） */
function toCapitalized(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * 将任意格式的变量名/短语拆分为单词数组。
 * 支持 camelCase、PascalCase、snake_case、kebab-case、点号/空格分隔，以及字母与数字混合边界。
 */
export function splitWords(input: string): string[] {
	return (
		input
			// 小写/数字后接大写：camelCase -> camel Case
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			// 连续大写后接大写+小写：HTTPServer -> HTTP Server
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			// 字母后接数字：version2 -> version 2
			.replace(/([a-zA-Z])(\d)/g, '$1 $2')
			// 按任意非字母数字分隔符拆分（下划线/连字符/点/空格等）
			.split(/[^a-zA-Z0-9]+/)
			.filter(Boolean)
	);
}

/** 常用变量名格式注册表 */
export const CASE_FORMATS: CaseFormat[] = [
	{
		id: 'camel',
		name: 'camelCase',
		description: '小驼峰：首单词小写，后续单词首字母大写',
		convert: (words) => words.map((w, i) => (i === 0 ? toLower(w) : toCapitalized(w))).join('')
	},
	{
		id: 'pascal',
		name: 'PascalCase',
		description: '大驼峰：每个单词首字母大写并直接拼接',
		convert: (words) => words.map(toCapitalized).join('')
	},
	{
		id: 'snake',
		name: 'snake_case',
		description: '蛇形：单词小写、下划线连接',
		convert: (words) => words.map(toLower).join('_')
	},
	{
		id: 'constant',
		name: 'SCREAMING_SNAKE_CASE',
		description: '常量命名：单词大写、下划线连接',
		convert: (words) => words.map(toUpper).join('_')
	},
	{
		id: 'kebab',
		name: 'kebab-case',
		description: '短横线：单词小写、连字符连接',
		convert: (words) => words.map(toLower).join('-')
	},
	{
		id: 'train',
		name: 'Train-Case',
		description: '单词首字母大写、连字符连接',
		convert: (words) => words.map(toCapitalized).join('-')
	},
	{
		id: 'dot',
		name: 'dot.case',
		description: '点分隔：单词小写、点号连接',
		convert: (words) => words.map(toLower).join('.')
	},
	{
		id: 'lower',
		name: 'lower case',
		description: '小写空格分隔',
		convert: (words) => words.map(toLower).join(' ')
	},
	{
		id: 'upper',
		name: 'UPPER CASE',
		description: '大写空格分隔',
		convert: (words) => words.map(toUpper).join(' ')
	},
	{
		id: 'sentence',
		name: 'Sentence case',
		description: '句子式：首单词首字母大写，其余小写，空格分隔',
		convert: (words) => toCapitalized(words.map(toLower).join(' '))
	},
	{
		id: 'title',
		name: 'Title Case',
		description: '标题式：每个单词首字母大写，空格分隔',
		convert: (words) => words.map(toCapitalized).join(' ')
	}
];

/** 示例输入集合（供示例按钮循环切换） */
export const CASE_EXAMPLES: string[] = [
	'myVariableName',
	'HTTPServer',
	'user_profile_id',
	'parse-json-data',
	'version2Release'
];

/** 检测输入命中了哪些常用格式 */
export function detectCaseFormats(input: string): CaseFormatId[] {
	const trimmed = input.trim();
	if (!trimmed) return [];
	const words = splitWords(trimmed);
	if (words.length === 0) return [];

	// 单词数组只包含一个单词时，无法区分各分隔格式，按大小写特征标注无分隔格式
	if (words.length === 1) {
		const word = words[0];
		if (/^[a-z0-9]/.test(word)) return ['camel'];
		if (word === word.toUpperCase()) return ['constant'];
		return ['pascal'];
	}

	const matched: CaseFormatId[] = [];
	// 还原比较：该格式转换后与输入完全一致
	for (const f of CASE_FORMATS) {
		if (f.convert(words) === trimmed) matched.push(f.id);
	}
	// 缩略词兜底：无分隔符的首字母大写/小写输入（如 HTTPServer）标注为大/小驼峰
	if (matched.length === 0) {
		if (!/[^a-zA-Z0-9]/.test(trimmed)) {
			matched.push(/^[A-Z]/.test(trimmed) ? 'pascal' : 'camel');
		}
	}
	return matched;
}
