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
			// 配置 API
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

			// 代理 API — 服务端转发 AI API 请求，绕过 CORS 与混合内容限制
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

			// 认证 API
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

			// Virtio 下载 API — 代理抓取 Fedora People 目录列表
			server.middlewares.use('/api/virtio', async (req, res) => {
				res.setHeader('Content-Type', 'application/json');

				const reqUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
				const action = reqUrl.searchParams.get('action') || 'versions';
				const version = reqUrl.searchParams.get('version') || '';

				const BASE = 'https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/archive-virtio';

				try {
					if (action === 'versions') {
						// 抓取 archive 根目录，提取版本文件夹列表
						const resp = await fetch(BASE + '/');
						const html = await resp.text();
						const versions: { name: string; date: string }[] = [];

						// 匹配 <a href="virtio-win-.../"> 并提取日期
						const folderRe =
							/<a href="(virtio-win-[^/]+)\/">([^<]*)<\/a>\s*([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2})/g;
						let match;
						while ((match = folderRe.exec(html)) !== null) {
							versions.push({ name: match[1], date: match[3] });
						}
						// 按时间倒序排列（最新在前）
						versions.sort((a, b) => b.date.localeCompare(a.date));
						res.end(JSON.stringify({ ok: true, versions }));
					} else if (action === 'files' && version) {
						// 抓取指定版本目录，提取文件列表
						const resp = await fetch(BASE + '/' + version + '/');
						const html = await resp.text();
						const files: { name: string; size: string; date: string }[] = [];

						// 匹配文件条目（排除目录、父目录、CHECKSUM、链接等）
						const fileRe =
							/<a href="([^"]+)">([^<]*)<\/a>\s*([0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2})\s+([0-9.]+[KMGTPE]?)/g;
						let match2;
						while ((match2 = fileRe.exec(html)) !== null) {
							const name = match2[1];
							// 跳过目录、父目录、CHECKSUM
							if (name.endsWith('/') || name === 'CHECKSUM' || name === 'Parent Directory') continue;
							if (name.startsWith('?') || name.startsWith('/')) continue;
							files.push({ name, size: match2[4], date: match2[3] });
						}
						res.end(JSON.stringify({ ok: true, version, files }));
					} else {
						res.statusCode = 400;
						res.end(JSON.stringify({ ok: false, error: 'Invalid parameters' }));
					}
				} catch (e: any) {
					res.statusCode = 502;
					res.end(JSON.stringify({ ok: false, error: e.message || String(e) }));
				}
			});
		}
	};
}
