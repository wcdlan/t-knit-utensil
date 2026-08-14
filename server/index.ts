import { createServer } from 'node:http';
import { createDB, resolvePassword } from './config.shared.ts';

const PORT = Number(process.env.PORT) || 8080;
const root = process.cwd();
const db = createDB(root);

function sendJSON(res: import('node:http').ServerResponse, status: number, body: unknown) {
	res.setHeader('Content-Type', 'application/json');
	res.statusCode = status;
	res.end(JSON.stringify(body));
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let raw = '';
		req.on('data', (chunk) => (raw += chunk));
		req.on('end', () => resolve(raw));
		req.on('error', reject);
	});
}

const server = createServer(async (req, res) => {
	const url = req.url || '/';

	// POST /api/auth — 密码校验，成功返回 token（前端只判非空）
	if (url === '/api/auth' && req.method === 'POST') {
		try {
			const { password } = JSON.parse(await readBody(req));
			if (password === (await resolvePassword(db, root))) {
				sendJSON(res, 200, { ok: true, token: 'tku-' + Date.now().toString(36) });
			} else {
				sendJSON(res, 401, { ok: false, error: '密码错误' });
			}
		} catch {
			sendJSON(res, 400, { ok: false, error: '请求格式错误' });
		}
		return;
	}

	// GET /api/config — 读运行时配置（site.db.json）
	if (url === '/api/config' && req.method === 'GET') {
		try {
			sendJSON(res, 200, await db.getData('/'));
		} catch {
			sendJSON(res, 200, {});
		}
		return;
	}

	// POST /api/config — 覆写配置并保存（幂等 reset）
	if (url === '/api/config' && req.method === 'POST') {
		try {
			const data = JSON.parse(await readBody(req));
			try {
				await db.getData('/');
			} catch {
				/* ensure loaded */
			}
			db.resetData(data);
			await db.save();
			sendJSON(res, 200, { ok: true });
		} catch (e) {
			sendJSON(res, 400, { ok: false, error: String(e) });
		}
		return;
	}

	// POST /api/proxy — 服务端转发外部请求绕过 CORS（AiApiTester 用）
	if (url === '/api/proxy' && req.method === 'POST') {
		try {
			const { url: target, method, headers, body: reqBody } = JSON.parse(await readBody(req));
			const fetchOptions: RequestInit = {
				method: method || 'GET',
				headers: headers || {}
			};
			if (reqBody != null && method && String(method).toUpperCase() !== 'GET') {
				fetchOptions.body = reqBody;
			}
			const upstream = await fetch(target, fetchOptions);
			const respText = await upstream.text();
			sendJSON(res, 200, {
				ok: true,
				status: upstream.status,
				statusText: upstream.statusText,
				body: respText
			});
		} catch (e: any) {
			sendJSON(res, 502, { ok: false, error: e?.message || String(e) });
		}
		return;
	}

	// GET /api/health — 健康检查
	if (url === '/api/health') {
		sendJSON(res, 200, { ok: true });
		return;
	}

	// 其余路径 / 方法统一 404（未匹配）
	sendJSON(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
	console.log(`TKU API server listening on http://0.0.0.0:${PORT}`);
});