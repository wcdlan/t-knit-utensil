import crypto from 'node:crypto';
import type { Plugin } from 'vite';
import { createDB, resolvePassword } from './server/config.shared.ts';
import type { JsonDB } from './server/config.shared.ts';

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

						const expected = await resolvePassword(db, root);

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
