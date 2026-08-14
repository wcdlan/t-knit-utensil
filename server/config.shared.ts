import path from 'node:path';
import fs from 'node:fs';
import { Config, JsonDB } from 'node-json-db';

export type { JsonDB };

export function createDB(root: string) {
	return new JsonDB(new Config(path.resolve(root, 'site.db.json'), true, true, '/'));
}

export function readDefaultConfig(root: string) {
	try {
		return JSON.parse(fs.readFileSync(path.resolve(root, 'site.config.json'), 'utf-8'));
	} catch {
		return {};
	}
}

/**
 * 解析密码，与 vite-plugin-config.ts 保持一致：
 * 运行时 site.db.json → 默认 site.config.json → "admin"
 */
export async function resolvePassword(db: JsonDB, root: string): Promise<string> {
	try {
		const data = (await db.getData('/auth/password')) as unknown;
		return String(data);
	} catch {
		return (readDefaultConfig(root) as { auth?: { password?: string } })?.auth?.password || 'admin';
	}
}