export const icons = {
	// 编解码
	lock: 'mdi:lock',
	link: 'mdi:link',
	web: 'mdi:web',
	// 格式化
	star: 'mdi:star-four-points',
	clipboard: 'mdi:clipboard-text-outline',
	database: 'mdi:database-outline',
	// 数据转换
	swap: 'mdi:swap-horizontal',
	clock: 'mdi:clock-outline',
	palette: 'mdi:palette',
	// 数据生成
	lightning: 'mdi:lightning-bolt',
	identifier: 'mdi:card-account-details-outline',
	shieldLock: 'mdi:shield-lock',
	qrcode: 'mdi:qrcode',
	key: 'mdi:key',
	// OpenSSH
	shieldKey: 'mdi:shield-key',
	// 图片工具
	image: 'mdi:image-outline',
	target: 'mdi:target',
	// 文本工具
	pencil: 'mdi:pencil-outline',
	magnify: 'mdi:magnify',
	chart: 'mdi:chart-bar',
	ruler: 'mdi:ruler-square',
	// AI 工具
	robot: 'mdi:robot-outline',
	testTube: 'mdi:test-tube',
	// 常用工具
	toolbox: 'mdi:toolbox-outline',
	script: 'mdi:script-text-outline',
	// 导航
	home: 'mdi:home-outline',
	cog: 'mdi:cog-outline',
	tools: 'mdi:tools',
	chevronRight: 'mdi:chevron-right',
	// 编码
	encoding: 'mdi:code-string',
	// 操作
	check: 'mdi:check',
	close: 'mdi:close',
	package: 'mdi:package-variant-closed',
	lightbulb: 'mdi:lightbulb-on-outline',
	textFormat: 'mdi:format-text'
} as const;

export type IconKey = keyof typeof icons;
