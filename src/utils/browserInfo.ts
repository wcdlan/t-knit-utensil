// 浏览器信息工具：UA 解析、环境信息采集、能力检测、公网 IP 查询与信息汇总
import { icons } from '@/data/icons';
import type {
	BatteryInfo,
	BrowserInfoExtras,
	BrowserInfoSection,
	CapabilityItem,
	GpuInfo,
	NavigatorWithExtras,
	NetworkInformationLike,
	PerformanceWithMemory,
	PublicNetworkInfo,
	StorageInfo,
	UserAgentInfo
} from '@/types/browser';

export type {
	BatteryInfo,
	BrowserInfoExtras,
	BrowserInfoSection,
	CapabilityItem,
	GpuInfo,
	PublicNetworkInfo,
	StorageInfo,
	UserAgentInfo
} from '@/types/browser';

/** 取带非标准扩展的 navigator */
function nav(): NavigatorWithExtras {
	return navigator as NavigatorWithExtras;
}

/** 未知值统一占位 */
const UNKNOWN = '未知';

/** 浏览器识别规则：顺序敏感，派生浏览器需排在 Chrome / Safari 之前 */
const BROWSER_RULES: { name: string; pattern: RegExp }[] = [
	{ name: 'Microsoft Edge', pattern: /Edg(?:e|A|iOS)?\/([\d.]+)/ },
	{ name: 'Opera', pattern: /(?:OPR|OPiOS|Opera)\/([\d.]+)/ },
	{ name: 'Samsung Internet', pattern: /SamsungBrowser\/([\d.]+)/ },
	{ name: 'Vivaldi', pattern: /Vivaldi\/([\d.]+)/ },
	{ name: 'Yandex Browser', pattern: /YaBrowser\/([\d.]+)/ },
	{ name: 'UC 浏览器', pattern: /UCBrowser\/([\d.]+)/ },
	{ name: 'QQ 浏览器', pattern: /QQBrowser\/([\d.]+)/ },
	{ name: 'Firefox', pattern: /(?:Firefox|FxiOS)\/([\d.]+)/ },
	{ name: 'Chrome', pattern: /(?:Chrome|CriOS)\/([\d.]+)/ },
	{ name: 'Safari', pattern: /Version\/([\d.]+)[^)]*Safari/ },
	{ name: 'Internet Explorer', pattern: /(?:MSIE\s|rv:)([\d.]+)/ }
];

/** Windows NT 版本号到市售版本名 */
const WINDOWS_VERSIONS: Record<string, string> = {
	'10.0': '10 / 11',
	'6.3': '8.1',
	'6.2': '8',
	'6.1': '7',
	'6.0': 'Vista',
	'5.2': 'Server 2003 / XP x64',
	'5.1': 'XP'
};

/** 解析 User-Agent 字符串为结构化信息 */
export function parseUserAgent(ua: string): UserAgentInfo {
	const matched = BROWSER_RULES.map((rule) => ({ name: rule.name, result: rule.pattern.exec(ua) })).find(
		(item) => item.result !== null
	);
	const browser = matched?.name ?? UNKNOWN;
	const browserVersion = matched?.result?.[1] ?? '';

	// 渲染引擎：先判断 Trident / Gecko / Blink / WebKit / Presto
	const blink = /(?:Chrome|Chromium|CriOS|Edg|OPR)\/([\d.]+)/.exec(ua);
	const gecko = /Gecko\/([\d.]+)/.exec(ua);
	const webkit = /AppleWebKit\/([\d.]+)/.exec(ua);
	const trident = /Trident\/([\d.]+)/.exec(ua);
	const presto = /Presto\/([\d.]+)/.exec(ua);
	let engine = UNKNOWN;
	let engineVersion = '';
	if (trident) {
		engine = 'Trident';
		engineVersion = trident[1];
	} else if (presto) {
		engine = 'Presto';
		engineVersion = presto[1];
	} else if (blink) {
		engine = 'Blink';
		engineVersion = blink[1];
	} else if (gecko && /Firefox|FxiOS/.test(ua)) {
		engine = 'Gecko';
		engineVersion = gecko[1];
	} else if (webkit) {
		engine = 'WebKit';
		engineVersion = webkit[1];
	}

	// 操作系统
	let os = UNKNOWN;
	let osVersion = '';
	const windows = /Windows NT ([\d.]+)/.exec(ua);
	const mac = /Mac OS X ([\d_.]+)/.exec(ua);
	const ios = /(?:iPhone|iPad|iPod)[^)]*OS ([\d_]+)/.exec(ua);
	const android = /Android ([\d.]+)/.exec(ua);
	if (windows) {
		os = 'Windows';
		osVersion = WINDOWS_VERSIONS[windows[1]] ?? windows[1];
	} else if (ios) {
		os = 'iOS';
		osVersion = ios[1].replace(/_/g, '.');
	} else if (mac) {
		os = 'macOS';
		osVersion = mac[1].replace(/_/g, '.');
	} else if (android) {
		os = 'Android';
		osVersion = android[1];
	} else if (/CrOS/.test(ua)) {
		os = 'ChromeOS';
	} else if (/HarmonyOS/.test(ua)) {
		os = 'HarmonyOS';
	} else if (/Linux/.test(ua)) {
		os = 'Linux';
	}

	const mobile = /Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua);
	const tablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
	const deviceType = mobile && !tablet ? '手机' : tablet ? '平板' : '桌面电脑';
	const bot = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|phantomjs|lighthouse/i.test(ua);

	return { browser, browserVersion, engine, engineVersion, os, osVersion, deviceType, mobile, bot };
}

/** 字节数格式化为可读大小 */
export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return UNKNOWN;
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(2) + ' KB';
	if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(2) + ' MB';
	return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

/** 秒数格式化为可读时长（用于电池剩余时间） */
function formatSeconds(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return UNKNOWN;
	if (seconds === 0) return '已充满';
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	return (h ? `${h} 小时 ` : '') + `${m} 分钟`;
}

/** 时区偏移格式化为 UTC±N */
function formatTimezoneOffset(): string {
	const offsetMinutes = -new Date().getTimezoneOffset();
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const abs = Math.abs(offsetMinutes);
	const hours = Math.floor(abs / 60);
	const minutes = abs % 60;
	return `UTC${sign}${hours}${minutes ? ':' + String(minutes).padStart(2, '0') : ''}`;
}

/** 采集 WebGL 显卡信息（部分浏览器出于隐私会屏蔽真实型号） */
export function collectGpuInfo(): GpuInfo {
	const fallback: GpuInfo = { vendor: UNKNOWN, renderer: UNKNOWN, webglVersion: UNKNOWN, maxTextureSize: UNKNOWN };
	try {
		const canvas = document.createElement('canvas');
		const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
		if (!gl) return fallback;
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		const vendor = debugInfo
			? String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ?? '')
			: String(gl.getParameter(gl.VENDOR) ?? '');
		const renderer = debugInfo
			? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? '')
			: String(gl.getParameter(gl.RENDERER) ?? '');
		return {
			vendor: vendor || UNKNOWN,
			renderer: renderer || UNKNOWN,
			webglVersion: String(gl.getParameter(gl.VERSION) ?? UNKNOWN),
			maxTextureSize: String(gl.getParameter(gl.MAX_TEXTURE_SIZE) ?? UNKNOWN)
		};
	} catch {
		return fallback;
	}
}

/** 采集网络连接信息（Network Information API，仅 Chromium 系支持） */
function collectConnection(): NetworkInformationLike | null {
	return nav().connection ?? null;
}

/** 采集电池状态（Battery Status API，仅部分浏览器支持） */
export async function collectBattery(): Promise<BatteryInfo | null> {
	const getBattery = nav().getBattery;
	if (typeof getBattery !== 'function') return null;
	try {
		const battery = await getBattery.call(navigator);
		return {
			charging: battery.charging,
			levelPercent: Math.round(battery.level * 100),
			chargingTimeText: formatSeconds(battery.chargingTime),
			dischargingTimeText: formatSeconds(battery.dischargingTime)
		};
	} catch {
		return null;
	}
}

/** 检测 localStorage / sessionStorage 是否可写（隐私模式下可能抛出异常） */
function isStorageUsable(kind: 'localStorage' | 'sessionStorage'): boolean {
	try {
		const storage = window[kind];
		const key = '__tku_probe__';
		storage.setItem(key, '1');
		storage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}

/** 采集存储能力与配额 */
export async function collectStorage(): Promise<StorageInfo> {
	const storage: StorageInfo = {
		localStorage: isStorageUsable('localStorage'),
		sessionStorage: isStorageUsable('sessionStorage'),
		indexedDB: typeof indexedDB !== 'undefined',
		cookies: navigator.cookieEnabled,
		usageBytes: null,
		quotaBytes: null,
		persisted: false
	};
	try {
		const manager = nav().storage;
		if (manager?.estimate) {
			const estimate = await manager.estimate();
			storage.usageBytes = estimate.usage ?? null;
			storage.quotaBytes = estimate.quota ?? null;
		}
		if (manager?.persisted) {
			storage.persisted = await manager.persisted();
		}
	} catch {
		// 配额查询失败时保留 null，由界面展示「未知」
	}
	return storage;
}

/** 实测屏幕刷新率：采样一段时间内 rAF 帧间隔求平均 */
export function estimateRefreshRate(sampleMs = 1000): Promise<number> {
	return new Promise((resolve) => {
		if (typeof requestAnimationFrame !== 'function') {
			resolve(0);
			return;
		}
		const frames: number[] = [];
		let startTime = 0;
		function onFrame(timestamp: number) {
			if (!startTime) startTime = timestamp;
			frames.push(timestamp);
			if (timestamp - startTime < sampleMs) {
				requestAnimationFrame(onFrame);
				return;
			}
			const deltas: number[] = [];
			for (let i = 1; i < frames.length; i++) deltas.push(frames[i] - frames[i - 1]);
			if (deltas.length === 0) {
				resolve(0);
				return;
			}
			const average = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
			resolve(average > 0 ? Math.round(1000 / average) : 0);
		}
		requestAnimationFrame(onFrame);
	});
}

/** 归一化公网信息接口返回（兼容 ipapi.co 与 ipwho.is 两种结构） */
function normalizePublicNetwork(raw: Record<string, unknown>): PublicNetworkInfo {
	const pick = (...keys: string[]): string => {
		for (const key of keys) {
			const value = raw[key];
			if (typeof value === 'string' && value) return value;
		}
		return '';
	};
	const connection = (raw.connection ?? {}) as Record<string, unknown>;
	const latitude = raw.latitude ?? raw.lat;
	const longitude = raw.longitude ?? raw.lon;
	return {
		ip: pick('ip', 'query'),
		country: pick('country_name', 'country'),
		region: pick('region', 'region_name'),
		city: pick('city'),
		isp: pick('isp') || String(connection.isp ?? ''),
		org: pick('org') || String(connection.org ?? ''),
		asn: pick('asn') || (connection.asn ? 'AS' + String(connection.asn) : ''),
		timezone: pick('timezone', 'timezone_id') || String((raw.timezone as Record<string, unknown>)?.id ?? ''),
		location:
			typeof latitude === 'number' && typeof longitude === 'number'
				? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
				: ''
	};
}

/**
 * 查询公网 IP 与归属信息。
 * 浏览器直接请求会受 CORS 限制，统一经服务端 /api/proxy 转发；依次尝试多个接口，全部失败则抛出错误。
 */
export async function fetchPublicNetworkInfo(): Promise<PublicNetworkInfo> {
	const endpoints = ['https://ipapi.co/json/', 'https://ipwho.is/'];
	let lastError = '公网信息查询失败';
	for (const endpoint of endpoints) {
		try {
			const response = await fetch('/api/proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: endpoint, method: 'GET', headers: { Accept: 'application/json' } })
			});
			const payload = (await response.json()) as { ok?: boolean; status?: number; body?: string; error?: string };
			if (!payload.ok || !payload.body) {
				lastError = payload.error || `上游响应异常（${payload.status ?? '未知状态'}）`;
				continue;
			}
			const parsed = JSON.parse(payload.body) as Record<string, unknown>;
			// ipapi.co 失败时会返回 { error: true, reason: ... }
			if (parsed.error) {
				lastError = String(parsed.reason ?? '接口返回错误');
				continue;
			}
			const info = normalizePublicNetwork(parsed);
			if (info.ip) return info;
			lastError = '接口未返回 IP';
		} catch (e) {
			lastError = (e as Error).message;
		}
	}
	throw new Error(lastError);
}

/** 采集性能与内存信息 */
function collectPerformanceItems(): { label: string; value: string; mono?: boolean }[] {
	const items: { label: string; value: string; mono?: boolean }[] = [];
	try {
		const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		const entry = entries[0];
		if (entry) {
			const load = entry.loadEventEnd - entry.startTime;
			const domReady = entry.domContentLoadedEventEnd - entry.startTime;
			const ttfb = entry.responseStart - entry.startTime;
			items.push({ label: '首字节时间（TTFB）', value: ttfb > 0 ? ttfb.toFixed(0) + ' ms' : UNKNOWN });
			items.push({ label: 'DOM 就绪耗时', value: domReady > 0 ? domReady.toFixed(0) + ' ms' : UNKNOWN });
			items.push({ label: '页面加载耗时', value: load > 0 ? load.toFixed(0) + ' ms' : UNKNOWN });
		}
	} catch {
		// 忽略：部分环境不支持 Navigation Timing
	}
	const memory = (performance as PerformanceWithMemory).memory;
	if (memory) {
		items.push({ label: 'JS 堆内存已用', value: formatBytes(memory.usedJSHeapSize), mono: true });
		items.push({
			label: 'JS 堆内存上限',
			value: `${formatBytes(memory.jsHeapSizeLimit)}（当前分配 ${formatBytes(memory.totalJSHeapSize)}）`,
			mono: true
		});
	}
	return items;
}

/**
 * 汇总全部同步可采集的信息分组。
 * 电池 / 存储 / 公网 IP / 刷新率为异步或按需数据，通过 extras 传入后并入对应分组。
 */
export function collectInfoSections(
	extras: BrowserInfoExtras,
	uaInfo: UserAgentInfo,
	gpu: GpuInfo
): BrowserInfoSection[] {
	const connection = collectConnection();
	const memoryGB = nav().deviceMemory;
	const uaData = nav().userAgentData;
	const sections: BrowserInfoSection[] = [];

	// 1. 浏览器与应用
	sections.push({
		id: 'browser',
		title: '浏览器与引擎',
		icon: icons.web,
		items: [
			{ label: '浏览器', value: `${uaInfo.browser}${uaInfo.browserVersion ? ' ' + uaInfo.browserVersion : ''}` },
			{ label: '完整版本', value: uaInfo.browserVersion || UNKNOWN, mono: true },
			{ label: '渲染引擎', value: `${uaInfo.engine}${uaInfo.engineVersion ? ' ' + uaInfo.engineVersion : ''}` },
			{ label: '浏览器品牌', value: uaData?.brands?.map((b) => `${b.brand} ${b.version}`).join('、') || UNKNOWN },
			{ label: '主语言', value: navigator.language || UNKNOWN, mono: true },
			{ label: '语言偏好', value: navigator.languages?.join('、') || UNKNOWN, mono: true },
			{
				label: '时区',
				value: `${Intl.DateTimeFormat().resolvedOptions().timeZone || UNKNOWN}（${formatTimezoneOffset()}）`
			},
			{ label: 'Cookie 可用', value: navigator.cookieEnabled ? '是' : '否' },
			{ label: 'Do Not Track', value: navigator.doNotTrack === '1' ? '已开启' : '未开启' },
			{ label: '页面可见性', value: document.visibilityState === 'visible' ? '可见' : '已隐藏' },
			{ label: '页面状态', value: document.readyState },
			{ label: '是否自动化环境', value: uaInfo.bot ? '是（疑似爬虫 / 无头浏览器）' : '否' }
		]
	});

	// 2. 系统与设备
	sections.push({
		id: 'system',
		title: '系统与设备',
		icon: icons.monitor,
		items: [
			{ label: '操作系统', value: `${uaInfo.os}${uaInfo.osVersion ? ' ' + uaInfo.osVersion : ''}` },
			{ label: '设备类型', value: `${uaInfo.deviceType}（${uaInfo.mobile ? '移动端' : '非移动端'}）` },
			{ label: '平台标识', value: navigator.platform || UNKNOWN, mono: true },
			{ label: 'CPU 逻辑核心', value: navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' 核' : UNKNOWN },
			{ label: '设备内存', value: memoryGB ? `约 ${memoryGB} GB` : UNKNOWN },
			{ label: 'UA-CH 平台', value: uaData?.platform || '不支持（仅 Chromium 系提供）' },
			{ label: '触控点数', value: navigator.maxTouchPoints ? navigator.maxTouchPoints + ' 点' : '0（无触控）' },
			{ label: '显卡厂商', value: gpu.vendor, mono: true },
			{ label: '显卡型号', value: gpu.renderer, mono: true },
			{ label: '最大纹理尺寸', value: `${gpu.maxTextureSize} px`, mono: true }
		]
	});

	// 3. 屏幕与窗口
	sections.push({
		id: 'screen',
		title: '屏幕与窗口',
		icon: icons.monitorScreenshot,
		items: [
			{ label: '屏幕分辨率', value: `${screen.width} × ${screen.height}` },
			{ label: '可用区域', value: `${screen.availWidth} × ${screen.availHeight}` },
			{ label: '设备像素比', value: String(window.devicePixelRatio ?? UNKNOWN) },
			{ label: '颜色深度', value: `${screen.colorDepth} 位（像素深度 ${screen.pixelDepth} 位）` },
			{
				label: '屏幕方向',
				value: screen.orientation ? `${screen.orientation.type}（${screen.orientation.angle}°）` : UNKNOWN
			},
			{ label: '窗口尺寸（含边框）', value: `${window.outerWidth} × ${window.outerHeight}` },
			{ label: '视口尺寸（内容区）', value: `${window.innerWidth} × ${window.innerHeight}` },
			{
				label: '文档可视区',
				value: `${document.documentElement.clientWidth} × ${document.documentElement.clientHeight}`
			},
			{ label: '屏幕刷新率', value: extras.refreshRate ? `${extras.refreshRate} Hz（实测）` : '尚未检测' }
		]
	});

	// 4. 网络与连接
	sections.push({
		id: 'network',
		title: '网络与连接',
		icon: icons.ipNetwork,
		items: [
			{ label: '在线状态', value: navigator.onLine ? '在线' : '离线' },
			{ label: '有效连接类型', value: connection?.effectiveType ? connection.effectiveType.toUpperCase() : UNKNOWN },
			{ label: '连接方式', value: connection?.type ? connection.type : UNKNOWN },
			{ label: '预估下行带宽', value: connection?.downlink ? connection.downlink + ' Mbps' : UNKNOWN },
			{ label: '预估往返延迟', value: connection?.rtt ? connection.rtt + ' ms' : UNKNOWN },
			{
				label: '省流模式',
				value: connection?.saveData === undefined ? UNKNOWN : connection.saveData ? '已开启' : '未开启'
			},
			{ label: '协议', value: location.protocol.replace(':', '').toUpperCase() },
			{ label: '主机名', value: location.host || UNKNOWN, mono: true },
			{ label: '公网 IP', value: extras.publicNetwork?.ip || '查询中…', mono: true },
			{ label: 'IP 归属地', value: formatPublicLocation(extras.publicNetwork) },
			{ label: '运营商 / 机构', value: formatPublicOrg(extras.publicNetwork) },
			{ label: 'IP 时区', value: extras.publicNetwork?.timezone || UNKNOWN }
		]
	});

	// 5. 存储与配额
	const storage = extras.storage;
	sections.push({
		id: 'storage',
		title: '存储与配额',
		icon: icons.database,
		items: [
			{ label: 'localStorage', value: storage ? (storage.localStorage ? '可用' : '不可用') : '检测中…' },
			{ label: 'sessionStorage', value: storage ? (storage.sessionStorage ? '可用' : '不可用') : '检测中…' },
			{ label: 'IndexedDB', value: storage ? (storage.indexedDB ? '可用' : '不可用') : '检测中…' },
			{ label: 'Cookie', value: storage ? (storage.cookies ? '可用' : '不可用') : '检测中…' },
			{
				label: '已用存储',
				value: storage?.usageBytes != null ? formatBytes(storage.usageBytes) : UNKNOWN
			},
			{
				label: '存储配额',
				value: storage?.quotaBytes != null ? formatBytes(storage.quotaBytes) : UNKNOWN
			},
			{ label: '持久化存储', value: storage ? (storage.persisted ? '已授权' : '未授权') : '检测中…' }
		]
	});

	// 6. 电池与电源
	const battery = extras.battery;
	sections.push({
		id: 'battery',
		title: '电池与电源',
		icon: icons.lightning,
		items: battery
			? [
					{ label: '充电状态', value: battery.charging ? '充电中' : '使用电池' },
					{ label: '电量', value: battery.levelPercent + '%' },
					{ label: '充满剩余', value: battery.charging ? battery.chargingTimeText : UNKNOWN },
					{ label: '可用剩余', value: battery.charging ? UNKNOWN : battery.dischargingTimeText }
				]
			: [{ label: '电池信息', value: '当前浏览器不支持电池状态接口（Chrome / Edge 支持）' }]
	});

	// 7. 性能与内存
	sections.push({
		id: 'performance',
		title: '性能与内存',
		icon: icons.chart,
		items: [
			...collectPerformanceItems(),
			{ label: '硬件并发数', value: navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' 线程' : UNKNOWN },
			{ label: '页面地址', value: location.href, mono: true }
		]
	});

	return sections;
}

/** 公网归属地文案 */
function formatPublicLocation(info: PublicNetworkInfo | null): string {
	if (!info) return '查询中…';
	return [info.country, info.region, info.city, info.location].filter(Boolean).join(' · ') || UNKNOWN;
}

/** 公网运营商文案 */
function formatPublicOrg(info: PublicNetworkInfo | null): string {
	if (!info) return '查询中…';
	return [info.isp, info.org, info.asn].filter(Boolean).join(' · ') || UNKNOWN;
}

/** 能力 / 特性检测清单 */
export function collectCapabilities(gpu: GpuInfo): CapabilityItem[] {
	const has = (fn: () => boolean): boolean => {
		try {
			return fn();
		} catch {
			return false;
		}
	};
	const canvas = has(() => !!document.createElement('canvas').getContext('2d'));
	const webgl = has(() => !!document.createElement('canvas').getContext('webgl'));
	const webgl2 = has(() => !!document.createElement('canvas').getContext('webgl2'));
	return [
		{ label: 'WebGL', supported: webgl, detail: gpu.webglVersion !== UNKNOWN ? gpu.webglVersion : undefined },
		{ label: 'WebGL 2', supported: webgl2 },
		{ label: 'WebGPU', supported: has(() => 'gpu' in navigator) },
		{ label: 'Canvas 2D', supported: canvas },
		{ label: 'WebAssembly', supported: has(() => typeof WebAssembly === 'object') },
		{ label: 'Service Worker', supported: has(() => 'serviceWorker' in navigator) },
		{ label: 'Web Worker', supported: has(() => typeof Worker !== 'undefined') },
		{ label: 'WebSocket', supported: has(() => typeof WebSocket !== 'undefined') },
		{ label: 'Server-Sent Events', supported: has(() => typeof EventSource !== 'undefined') },
		{ label: 'WebRTC', supported: has(() => typeof RTCPeerConnection !== 'undefined') },
		{ label: 'Fetch API', supported: has(() => typeof fetch === 'function') },
		{ label: 'IndexedDB', supported: has(() => typeof indexedDB !== 'undefined') },
		{ label: 'Storage API 配额', supported: has(() => !!nav().storage?.estimate) },
		{ label: 'Clipboard API', supported: has(() => !!navigator.clipboard) },
		{ label: 'Share API', supported: has(() => 'share' in navigator) },
		{ label: 'Notification', supported: has(() => 'Notification' in window) },
		{ label: 'Geolocation', supported: has(() => 'geolocation' in navigator) },
		{ label: 'File API', supported: has(() => typeof File !== 'undefined' && typeof FileReader !== 'undefined') },
		{ label: 'File System Access', supported: has(() => 'showOpenFilePicker' in window) },
		{ label: '拖拽 API', supported: has(() => 'ondrag' in document.createElement('div')) },
		{ label: 'Pointer Events', supported: has(() => 'PointerEvent' in window) },
		{ label: '触控事件', supported: has(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0) },
		{ label: 'Gamepad API', supported: has(() => 'getGamepads' in navigator) },
		{ label: '振动 API', supported: has(() => 'vibrate' in navigator) },
		{ label: 'Web Bluetooth', supported: has(() => 'bluetooth' in navigator) },
		{ label: 'Web USB', supported: has(() => 'usb' in navigator) },
		{ label: 'Web Serial', supported: has(() => 'serial' in navigator) },
		{ label: 'Payment Request', supported: has(() => typeof PaymentRequest !== 'undefined') },
		{ label: 'Credential Management', supported: has(() => 'credentials' in navigator) },
		{ label: 'Broadcast Channel', supported: has(() => typeof BroadcastChannel !== 'undefined') },
		{ label: 'Intersection Observer', supported: has(() => typeof IntersectionObserver !== 'undefined') },
		{ label: 'Resize Observer', supported: has(() => typeof ResizeObserver !== 'undefined') },
		{ label: 'Mutation Observer', supported: has(() => typeof MutationObserver !== 'undefined') },
		{ label: 'AbortController', supported: has(() => typeof AbortController !== 'undefined') },
		{ label: 'OffscreenCanvas', supported: has(() => typeof OffscreenCanvas !== 'undefined') },
		{ label: 'Web Animations', supported: has(() => 'animate' in document.createElement('div')) },
		{ label: 'Picture-in-Picture', supported: has(() => 'pictureInPictureEnabled' in document) },
		{ label: '全屏 API', supported: has(() => 'fullscreenEnabled' in document) },
		{ label: 'Screen Capture', supported: has(() => 'getDisplayMedia' in navigator.mediaDevices) },
		{ label: 'getUserMedia', supported: has(() => 'getUserMedia' in navigator.mediaDevices) },
		{ label: 'Intl（国际化）', supported: has(() => typeof Intl === 'object') },
		{ label: 'BigInt', supported: has(() => typeof BigInt === 'function') },
		{ label: 'Proxy', supported: has(() => typeof Proxy === 'function') },
		{ label: 'WeakRef', supported: has(() => typeof WeakRef === 'function') },
		{ label: 'structuredClone', supported: has(() => typeof structuredClone === 'function') },
		{ label: 'Cookie Store API', supported: has(() => 'cookieStore' in window) },
		{ label: 'CSS 容器查询', supported: has(() => CSS.supports('container-type: inline-size')) },
		{ label: 'CSS :has()', supported: has(() => CSS.supports('selector(:has(*))')) },
		{ label: 'CSS Grid', supported: has(() => CSS.supports('display', 'grid')) },
		{ label: 'CSS Flexbox', supported: has(() => CSS.supports('display', 'flex')) },
		{
			label: '深色模式偏好',
			supported: has(() => window.matchMedia('(prefers-color-scheme: dark)').matches),
			detail: '当前为深色'
		},
		{
			label: '减少动效偏好',
			supported: has(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches),
			detail: '当前已开启'
		}
	];
}

/** 汇总为纯文本报告（供「复制全部信息」使用） */
export function buildReportText(sections: BrowserInfoSection[], capabilities: CapabilityItem[], ua: string): string {
	const lines: string[] = ['=== 浏览器信息（TKU 浏览器信息工具） ===', ''];
	for (const section of sections) {
		lines.push(`【${section.title}】`);
		for (const item of section.items) lines.push(`${item.label}：${item.value}`);
		lines.push('');
	}
	const supported = capabilities.filter((c) => c.supported).map((c) => c.label);
	const unsupported = capabilities.filter((c) => !c.supported).map((c) => c.label);
	lines.push('【能力支持】');
	lines.push(`已支持（${supported.length}）：${supported.join('、') || '无'}`);
	lines.push(`不支持（${unsupported.length}）：${unsupported.join('、') || '无'}`);
	lines.push('');
	lines.push('【User-Agent】');
	lines.push(ua);
	return lines.join('\n');
}
