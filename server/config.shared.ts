import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

export interface Store {
	getConfig(): object;
	setConfig(data: unknown): void;
	close(): void;
}

/**
 * 运行时配置存储：SQLite 单行 JSON（config 表 id=1 存整个配置 JSON 字符串）。
 * 语义对齐原 node-json-db：GET 全量读、POST 全量覆写。
 */
export function createStore(root: string, dbPath?: string): Store {
	const db = new Database(dbPath ? path.resolve(root, dbPath) : path.resolve(root, 'site.db'));
	db.exec('CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY CHECK (id = 1), value TEXT NOT NULL)');
	return {
		getConfig(): object {
			const row = db.prepare('SELECT value FROM config WHERE id = 1').get() as { value: string } | undefined;
			return row ? JSON.parse(row.value) : {};
		},
		setConfig(data: unknown): void {
			db.prepare(
				'INSERT INTO config (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value'
			).run(JSON.stringify(data));
		},
		close(): void {
			db.close();
		}
	};
}

export function readDefaultConfig(root: string) {
	try {
		return JSON.parse(fs.readFileSync(path.resolve(root, 'site.config.json'), 'utf-8'));
	} catch {
		return {};
	}
}

/**
 * 密码解析，与既有优先级一致：运行时 site.db → 默认 site.config.json → "admin"
 */
export function resolvePassword(store: Store, root: string): string {
	const runtime = store.getConfig() as { auth?: { password?: string } };
	return (
		runtime.auth?.password || (readDefaultConfig(root) as { auth?: { password?: string } })?.auth?.password || 'admin'
	);
}
