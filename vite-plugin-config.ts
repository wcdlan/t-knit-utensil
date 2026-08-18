import crypto from 'node:crypto';
import type { Plugin } from 'vite';
import type { Store } from './server/config.shared.ts';
import { createStore, resolvePassword } from './server/config.shared.ts';
import { generateSshKeyPair, getSshKeygenAvailability } from './server/ssh-keygen.ts';

const validTokens = new Set<string>();

export function configPlugin(): Plugin {
	let store: Store;
	let root = process.cwd();

	return {
		name: 'vite-plugin-config',
		configResolved(config) {
			root = config.root;
			store = createStore(root);
		},
		configureServer(server) {
			// Config API
			server.middlewares.use('/api/config', async (req, res) => {
				res.setHeader('Content-Type', 'application/json');

				if (req.method === 'GET') {
					res.end(JSON.stringify(store.getConfig()));
				} else if (req.method === 'POST') {
					let body = '';
					req.on('data', (chunk) => (body += chunk));
					req.on('end', () => {
						try {
							const data = JSON.parse(body);
							store.setConfig(data);
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

			// SSH keygen API — 检测 ssh-keygen 二进制 / 生成密钥对
			server.middlewares.use('/api/ssh-keygen/check', async (_req, res) => {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ ok: true, ...getSshKeygenAvailability() }));
			});

			server.middlewares.use('/api/ssh-keygen/generate', async (req, res) => {
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
						const { type, comment, passphrase } = JSON.parse(body);
						const out = await generateSshKeyPair({ type, comment, passphrase });
						res.end(JSON.stringify({ ok: true, ...out }));
					} catch (e: any) {
						res.statusCode = e?.status ?? 500;
						res.end(JSON.stringify({ ok: false, error: e?.message ?? String(e) }));
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
				req.on('end', () => {
					try {
						const { password } = JSON.parse(body);

						const expected = resolvePassword(store, root);

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
