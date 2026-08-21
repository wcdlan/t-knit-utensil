import {
	randBetweenDate,
	randBoolean,
	randCity,
	randEmail,
	randFullName,
	randIp,
	randNumber,
	randPhoneNumber,
	randProductName,
	randSentence,
	randText,
	randUuid
} from '@ngneat/falso';
import type { JsonGenMode } from '@/types/json';

// ---- 辅助函数 ----

/** 随机取一个数组元素 */
function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** 随机日期字符串 YYYY-MM-DD HH:mm:ss */
function randomDateString(): string {
	const d = randBetweenDate({ from: new Date('2018-01-01'), to: new Date('2025-12-31') });
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ---- 结构化生成 ----

/** 生成一个用户记录对象 */
function randomUserRecord(): Record<string, unknown> {
	const name = randFullName();
	return {
		id: randUuid().slice(0, 8),
		name,
		email: randEmail({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] ?? '' }),
		phone: randPhoneNumber(),
		age: randNumber({ min: 18, max: 60 }),
		active: randBoolean(),
		city: randCity(),
		registeredAt: randomDateString(),
		roles: ['user', ...(Math.random() > 0.7 ? ['admin'] : [])]
	};
}

/** 随机标量值（覆盖多种 JSON 类型） */
function randomScalar(): string | number | boolean | null {
	const r = Math.random();
	if (r < 0.25) return randNumber({ min: 0, max: 9999 });
	if (r < 0.45) return randNumber({ min: 0, max: 999999, fraction: 2 });
	if (r < 0.6) return randBoolean();
	if (r < 0.7) return null;
	if (r < 0.85) return randProductName();
	return randSentence().slice(0, 40);
}

/** 递归生成嵌套对象节点 */
function randomObjectNode(depth: number, maxDepth: number): Record<string, unknown> {
	const obj: Record<string, unknown> = {};
	const fieldCount = randNumber({ min: 3, max: 6 });
	const keys = [
		'id',
		'name',
		'type',
		'status',
		'value',
		'count',
		'enabled',
		'createdAt',
		'updatedAt',
		'data',
		'meta',
		'tags',
		'items',
		'config',
		'owner',
		'remark'
	];
	const used = new Set<string>();
	for (let i = 0; i < fieldCount; i++) {
		let key = pick(keys);
		while (used.has(key)) key = pick(keys);
		used.add(key);

		const r = Math.random();
		if (depth < maxDepth && r < 0.3) {
			obj[key] = randomObjectNode(depth + 1, maxDepth);
		} else if (depth < maxDepth && r < 0.5) {
			const arr = [];
			const len = randNumber({ min: 2, max: 5 });
			for (let j = 0; j < len; j++) {
				arr.push(Math.random() > 0.5 ? randomObjectNode(depth + 1, maxDepth) : randomScalar());
			}
			obj[key] = arr;
		} else {
			obj[key] = randomScalar();
		}
	}
	return obj;
}

// ---- 各模式生成器 ----

/** 基础对象：常用字段的简单结构 */
function generateBasic(): Record<string, unknown> {
	return {
		name: randFullName(),
		age: randNumber({ min: 18, max: 60 }),
		email: randEmail(),
		active: randBoolean(),
		city: randCity(),
		score: randNumber({ min: 0, max: 100, fraction: 1 }),
		createdAt: randomDateString()
	};
}

/** 全格式对象：覆盖 JSON 所有数据类型，多层嵌套 */
function generateRich(): Record<string, unknown> {
	return {
		id: randUuid().slice(0, 8),
		name: randProductName(),
		description: randSentence(),
		status: pick(['pending', 'processing', 'completed', 'failed']),
		priority: pick(['low', 'medium', 'high', 'critical']),
		progress: randNumber({ min: 0, max: 100 }),
		amount: randNumber({ min: 0, max: 9999, fraction: 2 }),
		rate: randNumber({ min: 0, max: 2, fraction: 4 }),
		active: randBoolean(),
		enabled: randBoolean(),
		deleted: Math.random() > 0.9,
		nullable: Math.random() > 0.5 ? randText({ charCount: 20 }) : null,
		tags: [randProductName(), randProductName(), randProductName()],
		owner: {
			id: randUuid().slice(0, 8),
			name: randFullName(),
			email: randEmail(),
			contact: { phone: randPhoneNumber(), address: `${randCity()}, ${randNumber({ min: 1, max: 999 })}` }
		},
		meta: {
			createdAt: randomDateString(),
			updatedAt: randomDateString(),
			version: `${randNumber({ min: 1, max: 5 })}.${randNumber({ min: 0, max: 9 })}.${randNumber({ min: 0, max: 9 })}`,
			ip: randIp()
		},
		settings: {
			notifications: randBoolean(),
			theme: pick(['light', 'dark', 'system']),
			limit: randNumber({ min: 10, max: 1000 }),
			options: [true, false, randNumber({ min: 1, max: 9 }), 'auto']
		}
	};
}

/** 精简对象：字段少、结构扁平 */
function generateCompact(): Record<string, unknown> {
	if (Math.random() < 0.5) {
		return {
			id: randNumber({ min: 1, max: 99999 }),
			label: randProductName(),
			value: Math.random() > 0.5 ? randNumber({ min: 0, max: 999 }) : randBoolean()
		};
	}
	return {
		key: randUuid().slice(0, 8),
		name: randFullName(),
		count: randNumber({ min: 0, max: 999 })
	};
}

/** 数组集合：用户对象数组 */
function generateArray(): unknown[] {
	const len = randNumber({ min: 3, max: 8 });
	return Array.from({ length: len }, () => randomUserRecord());
}

/** 深层嵌套：递归多层结构 */
function generateDeep(): Record<string, unknown> {
	return randomObjectNode(1, 4);
}

const GENERATORS: Record<JsonGenMode, () => unknown> = {
	basic: generateBasic,
	rich: generateRich,
	compact: generateCompact,
	array: generateArray,
	deep: generateDeep
};

/**
 * 生成随机 JSON 数据（按模式），返回序列化字符串。
 * @param mode 生成模式
 * @param pretty 是否缩进格式化输出
 */
export function generateRandomJson(mode: JsonGenMode, pretty = true): string {
	const data = GENERATORS[mode]();
	return JSON.stringify(data, null, pretty ? 2 : 0);
}
