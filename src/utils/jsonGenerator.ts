import { faker } from '@faker-js/faker';
import type { JsonGenMode } from '@/types/json';

// ---- 辅助函数 ----

/** 随机取一个数组元素 */
function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/** 随机日期字符串 YYYY-MM-DD HH:mm:ss */
function randomDateString(): string {
	const d = faker.date.between({ from: new Date('2018-01-01'), to: new Date('2025-12-31') });
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ---- 结构化生成 ----

/** 生成一个用户记录对象 */
function randomUserRecord(): Record<string, unknown> {
	const name = faker.person.fullName();
	return {
		id: faker.string.uuid().slice(0, 8),
		name,
		email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] ?? '' }),
		phone: faker.phone.number(),
		age: faker.number.int({ min: 18, max: 60 }),
		active: faker.datatype.boolean(),
		city: faker.location.city(),
		registeredAt: randomDateString(),
		roles: ['user', ...(Math.random() > 0.7 ? ['admin'] : [])]
	};
}

/** 随机标量值（覆盖多种 JSON 类型） */
function randomScalar(): string | number | boolean | null {
	const r = Math.random();
	if (r < 0.25) return faker.number.int({ min: 0, max: 9999 });
	if (r < 0.45) return faker.number.float({ min: 0, max: 999999, fractionDigits: 2 });
	if (r < 0.6) return faker.datatype.boolean();
	if (r < 0.7) return null;
	if (r < 0.85) return faker.commerce.productName();
	return faker.lorem.sentence().slice(0, 40);
}

/** 递归生成嵌套对象节点 */
function randomObjectNode(depth: number, maxDepth: number): Record<string, unknown> {
	const obj: Record<string, unknown> = {};
	const fieldCount = faker.number.int({ min: 3, max: 6 });
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
			const len = faker.number.int({ min: 2, max: 5 });
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
		name: faker.person.fullName(),
		age: faker.number.int({ min: 18, max: 60 }),
		email: faker.internet.email(),
		active: faker.datatype.boolean(),
		city: faker.location.city(),
		score: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
		createdAt: randomDateString()
	};
}

/** 全格式对象：覆盖 JSON 所有数据类型，多层嵌套 */
function generateRich(): Record<string, unknown> {
	return {
		id: faker.string.uuid().slice(0, 8),
		name: faker.commerce.productName(),
		description: faker.lorem.sentence(),
		status: pick(['pending', 'processing', 'completed', 'failed']),
		priority: pick(['low', 'medium', 'high', 'critical']),
		progress: faker.number.int({ min: 0, max: 100 }),
		amount: faker.number.float({ min: 0, max: 9999, fractionDigits: 2 }),
		rate: faker.number.float({ min: 0, max: 2, fractionDigits: 4 }),
		active: faker.datatype.boolean(),
		enabled: faker.datatype.boolean(),
		deleted: Math.random() > 0.9,
		nullable: Math.random() > 0.5 ? faker.lorem.text() : null,
		tags: [faker.commerce.productName(), faker.commerce.productName(), faker.commerce.productName()],
		owner: {
			id: faker.string.uuid().slice(0, 8),
			name: faker.person.fullName(),
			email: faker.internet.email(),
			contact: {
				phone: faker.phone.number(),
				address: `${faker.location.city()}, ${faker.number.int({ min: 1, max: 999 })}`
			}
		},
		meta: {
			createdAt: randomDateString(),
			updatedAt: randomDateString(),
			version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
			ip: faker.internet.ip()
		},
		settings: {
			notifications: faker.datatype.boolean(),
			theme: pick(['light', 'dark', 'system']),
			limit: faker.number.int({ min: 10, max: 1000 }),
			options: [true, false, faker.number.int({ min: 1, max: 9 }), 'auto']
		}
	};
}

/** 精简对象：字段少、结构扁平 */
function generateCompact(): Record<string, unknown> {
	if (Math.random() < 0.5) {
		return {
			id: faker.number.int({ min: 1, max: 99999 }),
			label: faker.commerce.productName(),
			value: Math.random() > 0.5 ? faker.number.int({ min: 0, max: 999 }) : faker.datatype.boolean()
		};
	}
	return {
		key: faker.string.uuid().slice(0, 8),
		name: faker.person.fullName(),
		count: faker.number.int({ min: 0, max: 999 })
	};
}

/** 数组集合：用户对象数组 */
function generateArray(): unknown[] {
	const len = faker.number.int({ min: 3, max: 8 });
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
