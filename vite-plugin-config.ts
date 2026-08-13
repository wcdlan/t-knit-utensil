import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Config, JsonDB } from 'node-json-db';
import type { Plugin } from 'vite';

function createDB(root: string) {
	return new JsonDB(new Config(path.resolve(root, 'site.db.json'), true, true, '/'));
}

function readDefaultConfig(root: string) {
	try {
		return JSON.parse(fs.readFileSync(path.resolve(root, 'site.config.json'), 'utf-8'));
	} catch {
		return {};
	}
}

const validTokens = new Set<string>();

export function configPlugin(): Plugin {
	let db: JsonDB;
	let root = process.cwd();

	return {
		name: 'vite-plugin-config',
		configResolved(config) {
			root = config.root;
			db = createDB(root);
		},
		configureServer(server) {
			// Config API
			server.middlewares.use('/api/config', async (req, res) => {
				res.setHeader('Content-Type', 'application/json');

				if (req.method === 'GET') {
					try {
						const data = await db.getData('/');
						res.end(JSON.stringify(data));
					} catch {
						res.end(JSON.stringify({}));
					}
				} else if (req.method === 'POST') {
					let body = '';
					req.on('data', (chunk) => (body += chunk));
					req.on('end', async () => {
						try {
							const data = JSON.parse(body);
							try {
								await db.getData('/');
							} catch {
								/* ensure loaded */
							}
							db.resetData(data);
							await db.save();
							res.end(JSON.stringify({ ok: true }));
						} catch (e) {
							res.statusCode = 400;
							res.end(JSON.stringify({ ok: false, error: String(e) }));
						}
					});
				} else {
					res.statusCode = 405;
					res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
				}
			});

			// Proxy API — forwards AI API requests server-side to bypass CORS + mixed-content
			server.middlewares.use('/api/proxy', async (req, res) => {
				if (req.method !== 'POST') {
					res.statusCode = 405;
					res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
					return;
				}

				let body = '';
				req.on('data', (chunk) => (body += chunk));
				req.on('end', async () => {
					try {
						const { url, method, headers, body: reqBody } = JSON.parse(body);

						const fetchOptions: RequestInit = {
							method: method || 'GET',
							headers: headers || {}
						};

						if (reqBody != null && method && method.toUpperCase() !== 'GET') {
							fetchOptions.body = reqBody;
						}

						const upstream = await fetch(url, fetchOptions);
						const respText = await upstream.text();

						res.end(
							JSON.stringify({
								ok: true,
								status: upstream.status,
								statusText: upstream.statusText,
								body: respText
							})
						);
					} catch (e: any) {
						res.statusCode = 502;
						res.end(JSON.stringify({ ok: false, error: e.message || String(e) }));
					}
				});
			});

			// Auth API
			server.middlewares.use('/api/auth', async (req, res) => {
				res.setHeader('Content-Type', 'application/json');

				if (req.method !== 'POST') {
					res.statusCode = 405;
					res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
					return;
				}

				let body = '';
				req.on('data', (chunk) => (body += chunk));
				req.on('end', async () => {
					try {
						const { password } = JSON.parse(body);

						// Get password: runtime db first, fallback to default config
						let expected = '';
						try {
							const data = await db.getData('/auth/password');
							expected = data;
						} catch {
							expected = readDefaultConfig(root)?.auth?.password || 'admin';
						}

						if (password === expected) {
							const token = crypto.randomBytes(32).toString('hex');
							validTokens.add(token);
							res.end(JSON.stringify({ ok: true, token }));
						} else {
							res.statusCode = 401;
							res.end(JSON.stringify({ ok: false, error: '密码错误' }));
						}
					} catch {
						res.statusCode = 400;
						res.end(JSON.stringify({ ok: false, error: '请求格式错误' }));
					}
				});
			});
		}
	};
}
