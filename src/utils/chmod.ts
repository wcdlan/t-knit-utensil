// chmod 权限计算：八进制 / 符号表示 / 权限位勾选三者的解析与互转

import type {
	ChmodBitId,
	ChmodBitMeta,
	ChmodClassId,
	ChmodClassMeta,
	ChmodExplainRow,
	ChmodParseResult,
	ChmodPreset,
	ChmodPresetCategory,
	ChmodSpecialId,
	ChmodSpecialMeta
} from '@/types/chmod';

/** 权限值上限（含 setuid / setgid / sticky 特殊位） */
export const CHMOD_MAX_MODE = 0o7777;

/** 三个权限作用对象（所有者 / 所属组 / 其他用户） */
export const CHMOD_CLASSES: ChmodClassMeta[] = [
	{ id: 'owner', name: '所有者', letter: 'u', shift: 6, hint: '文件的主人（user）' },
	{ id: 'group', name: '所属组', letter: 'g', shift: 3, hint: '文件所属用户组的成员（group）' },
	{ id: 'other', name: '其他用户', letter: 'o', shift: 0, hint: '既非所有者也不在组内的用户（other）' }
];

/** 三个基本权限位（r = 4、w = 2、x = 1） */
export const CHMOD_BITS: ChmodBitMeta[] = [
	{ id: 'read', name: '读取', letter: 'r', value: 4, hint: '文件：查看内容；目录：列出目录项' },
	{ id: 'write', name: '写入', letter: 'w', value: 2, hint: '文件：修改内容；目录：新建 / 删除 / 重命名' },
	{ id: 'execute', name: '执行', letter: 'x', value: 1, hint: '文件：作为程序运行；目录：进入（cd）' }
];

/** 三个特殊权限位（setuid 4 / setgid 2 / sticky 1，位于八进制的第四位） */
export const CHMOD_SPECIALS: ChmodSpecialMeta[] = [
	{
		id: 'setuid',
		name: 'setuid',
		letter: 's',
		value: 0o4000,
		octalDigit: 4,
		hint: '执行时临时以文件所有者身份运行（如 /usr/bin/passwd）'
	},
	{
		id: 'setgid',
		name: 'setgid',
		letter: 's',
		value: 0o2000,
		octalDigit: 2,
		hint: '执行时以所属组身份运行；作用于目录时，新建文件继承该目录的组'
	},
	{
		id: 'sticky',
		name: 'sticky',
		letter: 't',
		value: 0o1000,
		octalDigit: 1,
		hint: '目录内只有文件所有者才能删除 / 重命名自己的文件（如 /tmp）'
	}
];

/** 常用权限预设分类展示顺序 */
export const CHMOD_PRESET_CATEGORIES: ChmodPresetCategory[] = ['file', 'dir', 'special'];

/** 常用权限预设分类名称 */
export const CHMOD_PRESET_CATEGORY_LABELS: Record<ChmodPresetCategory, string> = {
	file: '文件常用权限',
	dir: '目录常用权限',
	special: '特殊位与经典场景'
};

/** 常用权限预设（符号表示由八进制推导，避免两处数据不一致） */
export const CHMOD_PRESETS: ChmodPreset[] = [
	{ octal: '400', category: 'file', description: '仅所有者可读', usage: '私密文件、证书（不可修改）' },
	{ octal: '600', category: 'file', description: '仅所有者可读写', usage: '私钥、.env 等敏感配置' },
	{ octal: '640', category: 'file', description: '所有者读写，同组只读', usage: '组内共享的配置文件' },
	{ octal: '644', category: 'file', description: '所有者读写，其他人只读', usage: '普通文件默认权限' },
	{ octal: '664', category: 'file', description: '所有者与同组可读写', usage: '团队协作的文件' },
	{ octal: '700', category: 'dir', description: '仅所有者可进入', usage: '私有目录（如 ~/.ssh）' },
	{ octal: '750', category: 'dir', description: '所有者可读写执行，同组可进入', usage: '组内共享目录（只读）' },
	{ octal: '755', category: 'dir', description: '所有人可读可进入，仅所有者可写', usage: 'Web 站点目录、可执行脚本' },
	{ octal: '775', category: 'dir', description: '所有者与同组可写', usage: '团队协作目录' },
	{ octal: '777', category: 'dir', description: '所有人可读可写可执行', usage: '仅限临时调试，生产环境有安全风险' },
	{ octal: '1777', category: 'special', description: '粘滞位目录：仅属主可删除自己的文件', usage: '/tmp、/var/tmp' },
	{ octal: '2755', category: 'special', description: 'setgid 目录：新建文件继承目录所属组', usage: '团队共享目录' },
	{
		octal: '4755',
		category: 'special',
		description: 'setuid 可执行文件：运行时临时提权',
		usage: '/usr/bin/passwd 等系统命令'
	}
];

/** 判断某作用对象是否拥有某个权限位 */
export function hasBit(mode: number, classId: ChmodClassId, bit: ChmodBitId): boolean {
	const classMeta = CHMOD_CLASSES.find((item) => item.id === classId);
	const bitMeta = CHMOD_BITS.find((item) => item.id === bit);
	if (!classMeta || !bitMeta) return false;
	return ((mode >> classMeta.shift) & 7 & bitMeta.value) !== 0;
}

/** 切换某个权限位，返回新的权限值 */
export function toggleBit(mode: number, classId: ChmodClassId, bit: ChmodBitId): number {
	const classMeta = CHMOD_CLASSES.find((item) => item.id === classId);
	const bitMeta = CHMOD_BITS.find((item) => item.id === bit);
	if (!classMeta || !bitMeta) return mode;
	return mode ^ (bitMeta.value << classMeta.shift);
}

/** 判断是否设置了某个特殊权限位 */
export function hasSpecial(mode: number, id: ChmodSpecialId): boolean {
	const meta = CHMOD_SPECIALS.find((item) => item.id === id);
	if (!meta) return false;
	return (mode & meta.value) !== 0;
}

/** 切换某个特殊权限位，返回新的权限值 */
export function toggleSpecial(mode: number, id: ChmodSpecialId): number {
	const meta = CHMOD_SPECIALS.find((item) => item.id === id);
	if (!meta) return mode;
	return mode ^ meta.value;
}

/** 取某个作用对象的八进制数字（0 ~ 7） */
export function getClassDigit(mode: number, classId: ChmodClassId): number {
	const meta = CHMOD_CLASSES.find((item) => item.id === classId);
	if (!meta) return 0;
	return (mode >> meta.shift) & 7;
}

/** 特殊位在某作用对象上的符号字母（无则返回 null） */
function getSpecialLetter(mode: number, classId: ChmodClassId): string | null {
	if (classId === 'owner' && hasSpecial(mode, 'setuid')) return 's';
	if (classId === 'group' && hasSpecial(mode, 'setgid')) return 's';
	if (classId === 'other' && hasSpecial(mode, 'sticky')) return 't';
	return null;
}

/** 取某个作用对象的符号表示（3 位，如 rwx / r-s / rwT） */
export function getClassSymbolic(mode: number, classId: ChmodClassId): string {
	const digit = getClassDigit(mode, classId);
	const special = getSpecialLetter(mode, classId);
	return CHMOD_BITS.map((bit) => {
		const on = (digit & bit.value) !== 0;
		if (bit.id !== 'execute') return on ? bit.letter : '-';
		if (special) return on ? special : special.toUpperCase();
		return on ? 'x' : '-';
	}).join('');
}

/** 转八进制文本：无特殊位为 3 位（755），有特殊位为 4 位（4755） */
export function formatOctal(mode: number): string {
	const value = mode & CHMOD_MAX_MODE;
	return (value & 0o7000) !== 0 ? value.toString(8).padStart(4, '0') : (value & 0o777).toString(8).padStart(3, '0');
}

/** 转四位八进制文本（含前导 0，如 0644 / 4755） */
export function formatOctalFull(mode: number): string {
	return (mode & CHMOD_MAX_MODE).toString(8).padStart(4, '0');
}

/** 转符号表示；withType 为 true 时带上文件类型位（按普通文件补 `-`，如 -rwxr-xr-x） */
export function toSymbolic(mode: number, withType = false): string {
	const body = CHMOD_CLASSES.map((meta) => getClassSymbolic(mode, meta.id)).join('');
	return withType ? `-${body}` : body;
}

/** 解析八进制文本（支持 755 / 0755 / 0o755 / 4755） */
export function parseOctal(text: string): ChmodParseResult {
	const raw = text.trim().replace(/^0[oO]/, '');
	if (!raw) return { ok: false, mode: 0, error: '请输入八进制权限值，如 755' };
	if (!/^[0-7]{1,4}$/.test(raw)) return { ok: false, mode: 0, error: '八进制只能包含 0-7，且长度为 1~4 位' };
	const mode = parseInt(raw, 8);
	if (mode > CHMOD_MAX_MODE) return { ok: false, mode: 0, error: '权限值不能超过 7777' };
	return { ok: true, mode };
}

/** 解析符号文本（支持 rwxr-xr-x 与带类型位的 -rwxr-xr-x、rwsr-xr-x） */
export function parseSymbolic(text: string): ChmodParseResult {
	let raw = text.trim();
	if (!raw) return { ok: false, mode: 0, error: '请输入符号权限，如 rwxr-xr-x' };
	// 允许带文件类型位（- 普通文件 / d 目录 / l 链接等），解析时忽略
	if (raw.length === 10 && /^[-dlbcps]/.test(raw)) raw = raw.slice(1);
	if (raw.length !== 9) return { ok: false, mode: 0, error: '符号权限需为 9 位（如 rwxr-xr-x）' };

	let mode = 0;
	for (let index = 0; index < 9; index++) {
		const char = raw[index];
		const classMeta = CHMOD_CLASSES[Math.floor(index / 3)];
		const bitMeta = CHMOD_BITS[index % 3];
		if (char === '-') continue;
		if (char.toLowerCase() === bitMeta.letter) {
			mode |= bitMeta.value << classMeta.shift;
			continue;
		}
		// s / t 只能出现在执行位上：小写表示特殊位与执行位同时开启，大写表示仅开启特殊位
		if (index % 3 === 2 && 'sStT'.includes(char)) {
			const lower = char.toLowerCase();
			if (lower === 's' && classMeta.id === 'other') {
				return { ok: false, mode: 0, error: 'setuid / setgid 只作用于所有者与所属组' };
			}
			if (lower === 't' && classMeta.id !== 'other') return { ok: false, mode: 0, error: 'sticky 位只作用于其他用户' };
			mode |= lower === 's' ? (classMeta.id === 'owner' ? 0o4000 : 0o2000) : 0o1000;
			if (char === lower) mode |= 1 << classMeta.shift;
			continue;
		}
		const expected = index % 3 === 2 ? `${bitMeta.letter} / - / s / t` : `${bitMeta.letter} / -`;
		return { ok: false, mode: 0, error: `第 ${index + 1} 位应为「${expected}」，当前为「${char}」` };
	}
	return { ok: true, mode };
}

/** 逐位拆解权限值（每个作用对象一行，供结果区展示） */
export function describeMode(mode: number): ChmodExplainRow[] {
	return CHMOD_CLASSES.map((meta) => {
		const digit = getClassDigit(mode, meta.id);
		const enabled = CHMOD_BITS.filter((bit) => (digit & bit.value) !== 0);
		return {
			label: meta.name,
			digit,
			symbolic: getClassSymbolic(mode, meta.id),
			// 单个权限位直接显示数字，多个权限位给出相加过程
			formula: enabled.length > 1 ? `${enabled.map((bit) => bit.value).join(' + ')} = ${digit}` : `${digit}`,
			description: enabled.length ? enabled.map((bit) => bit.name).join(' + ') : '无任何权限'
		};
	});
}

/** 生成 chmod 命令（目标为空时用占位符） */
export function buildChmodCommand(mode: number, target: string): string {
	return `chmod ${formatOctal(mode)} ${target.trim() || '<文件或目录>'}`;
}

/** 生成复制用结果摘要（多行文本） */
export function buildSummary(mode: number, target: string): string {
	const lines = [
		`权限：${formatOctal(mode)}（${toSymbolic(mode)}）`,
		...describeMode(mode).map((row) => `${row.label}：${row.symbolic}（${row.formula}，${row.description}）`)
	];
	const specials = CHMOD_SPECIALS.filter((meta) => hasSpecial(mode, meta.id));
	if (specials.length)
		lines.push(`特殊位：${specials.map((meta) => `${meta.name}（${meta.octalDigit}000）`).join('、')}`);
	lines.push(`命令：${buildChmodCommand(mode, target)}`);
	return lines.join('\n');
}
