import { createServer } from 'node:http';
import { createStore, resolvePassword } from './config.shared.ts';
import { generateSshKeyPair, getSshKeygenAvailability, installSshKeygen } from './ssh-keygen.ts';
import { getSystemInfo } from './system-info.ts';
import { handleDnsPing, handleDnsResolve, handleDnsServers } from './dns.ts';
import { handleTraceCheck, handleTraceRun } from './trace.ts';

const PORT = Number(process.env.PORT) || 8080;
const root = process.cwd();
// dbPath 支持容器持久化卷（如 /app/data/site.db）
const store = createStore(root, process.env.DB_PATH);

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

/** 读取并解析 JSON 请求体，解析失败返回 null（由处理器给出可读错误） */
async function readJsonBody(req: import('node:http').IncomingMessage): Promise<unknown> {
	try {
		return JSON.parse((await readBody(req)) || 'null');
	} catch {
		return null;
	}
}

const server = createServer(async (req, res) => {
	const url = req.url || '/';

	// POST /api/auth — 密码校验，成功返回 token（前端只判非空）
	if (url === '/api/auth' && req.method === 'POST') {
		try {
			const { password } = JSON.parse(await readBody(req));
			if (password === resolvePassword(store, root)) {
				sendJSON(res, 200, { ok: true, token: 'tku-' + Date.now().toString(36) });
			} else {
				sendJSON(res, 401, { ok: false, error: '密码错误' });
			}
		} catch {
			sendJSON(res, 400, { ok: false, error: '请求格式错误' });
		}
		return;
	}

	// GET /api/config — 读运行时配置（site.db）
	if (url === '/api/config' && req.method === 'GET') {
		sendJSON(res, 200, store.getConfig());
		return;
	}

	// POST /api/config — 覆写配置并保存（幂等覆盖）
	if (url === '/api/config' && req.method === 'POST') {
		try {
			const data = JSON.parse(await readBody(req));
			store.setConfig(data);
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

	// GET /api/ssh-keygen/check — 检测系统 ssh-keygen 二进制可用性
	if (url === '/api/ssh-keygen/check' && req.method === 'GET') {
		sendJSON(res, 200, { ok: true, ...getSshKeygenAvailability() });
		return;
	}

	// POST /api/ssh-keygen/install — 一键安装 OpenSSH（apt/dnf/yum/apk/zypper/brew），完成后重新检测
	if (url === '/api/ssh-keygen/install' && req.method === 'POST') {
		try {
			const status = await installSshKeygen();
			sendJSON(res, 200, { ok: true, ...status });
		} catch (e: any) {
			sendJSON(res, e?.status ?? 500, { ok: false, error: e?.message ?? String(e) });
		}
		return;
	}

	// GET /api/system/info — 部署机器信息（系统配置页「系统信息」展示）
	if (url === '/api/system/info' && req.method === 'GET') {
		sendJSON(res, 200, { ok: true, info: getSystemInfo() });
		return;
	}

	// POST /api/ssh-keygen/generate — 生成密钥对（服务端 spawn 系统 ssh-keygen）
	if (url === '/api/ssh-keygen/generate' && req.method === 'POST') {
		try {
			const { type, comment, passphrase } = JSON.parse(await readBody(req));
			const out = await generateSshKeyPair({ type, comment, passphrase });
			sendJSON(res, 200, { ok: true, ...out });
		} catch (e: any) {
			sendJSON(res, e?.status ?? 500, { ok: false, error: e?.message ?? String(e) });
		}
		return;
	}

	// GET /api/health — 健康检查
	if (url === '/api/health') {
		sendJSON(res, 200, { ok: true });
		return;
	}

	// GET /api/dns/servers — 系统默认 DNS 列表与 ping 可用性（网络解析工具用）
	if (url === '/api/dns/servers' && req.method === 'GET') {
		const { status, body } = await handleDnsServers();
		sendJSON(res, status, body);
		return;
	}

	// POST /api/dns/resolve — DNS 记录解析（系统默认 DNS 或指定 DNS 服务器）
	if (url === '/api/dns/resolve' && req.method === 'POST') {
		const { status, body } = await handleDnsResolve(await readJsonBody(req));
		sendJSON(res, status, body);
		return;
	}

	// POST /api/dns/ping — 主机可达性探测（ICMP ping 或 TCP 端口探测）
	if (url === '/api/dns/ping' && req.method === 'POST') {
		const { status, body } = await handleDnsPing(await readJsonBody(req));
		sendJSON(res, status, body);
		return;
	}

	// GET /api/net/trace/check — 路由追踪命令可用性（网络工具「路由追踪」用）
	if (url === '/api/net/trace/check' && req.method === 'GET') {
		const { status, body } = await handleTraceCheck();
		sendJSON(res, status, body);
		return;
	}

	// POST /api/net/trace — 路由追踪（调用系统 traceroute / tracert 逐跳探测）
	if (url === '/api/net/trace' && req.method === 'POST') {
		const { status, body } = await handleTraceRun(await readJsonBody(req));
		sendJSON(res, status, body);
		return;
	}

	// 其余路径 / 方法统一 404
	sendJSON(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
	console.log(`TKU API server listening on http://0.0.0.0:${PORT}`);
});
