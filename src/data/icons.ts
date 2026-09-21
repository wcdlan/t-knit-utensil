import type { QuickLinkIconGroup, QuickLinkIconOption } from '@/types/site';

export type { QuickLinkIconGroup, QuickLinkIconOption };

export const icons = {
	// 编解码
	lock: 'mdi:lock',
	link: 'mdi:link',
	web: 'mdi:web',
	jwt: 'mdi:shield-key-outline',
	// 格式化
	star: 'mdi:star-four-points',
	clipboard: 'mdi:clipboard-text-outline',
	database: 'mdi:database-outline',
	caseFormat: 'mdi:format-letter-case',
	// 数据转换
	swap: 'mdi:swap-horizontal',
	clock: 'mdi:clock-outline',
	palette: 'mdi:palette',
	b64Converter: 'mdi:file-code-outline',
	calendarClock: 'mdi:calendar-clock',
	chmod: 'mdi:file-lock-outline',
	filesize: 'mdi:file-swap-outline',
	// 数据生成
	lightning: 'mdi:lightning-bolt',
	identifier: 'mdi:card-account-details-outline',
	shieldLock: 'mdi:shield-lock',
	qrcode: 'mdi:qrcode',
	key: 'mdi:key',
	// OpenSSH（SSH 密钥）
	shieldKey: 'mdi:shield-key',
	// 图片工具
	image: 'mdi:image-outline',
	imageRefresh: 'mdi:image-refresh-outline',
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
	shuffle: 'mdi:shuffle-variant',
	raid: 'mdi:harddisk-plus',
	harddisk: 'mdi:harddisk',
	shieldCheck: 'mdi:shield-check-outline',
	// 导航
	home: 'mdi:home-outline',
	cog: 'mdi:cog-outline',
	tools: 'mdi:tools',
	keyboard: 'mdi:keyboard-outline',
	monitor: 'mdi:monitor',
	monitorScreenshot: 'mdi:monitor-screenshot',
	cron: 'mdi:calendar-sync-outline',
	chevronRight: 'mdi:chevron-right',
	chevronDown: 'mdi:chevron-down',
	// 编码
	encoding: 'mdi:code-string',
	// 网络工具
	ipNetwork: 'mdi:ip-network-outline',
	ipv4: 'mdi:ip',
	ipv6: 'mdi:ip-outline',
	subnet: 'mdi:vector-square',
	// 操作
	check: 'mdi:check',
	close: 'mdi:close',
	info: 'mdi:information-outline',
	package: 'mdi:package-variant-closed',
	lightbulb: 'mdi:lightbulb-on-outline',
	textFormat: 'mdi:format-text',
	// 快捷连接
	gitHub: 'mdi:github',
	gitlab: 'mdi:gitlab',
	sourceBranch: 'mdi:source-branch',
	telegram: 'mdi:telegram',
	email: 'mdi:email-outline',
	rss: 'mdi:rss',
	notebook: 'mdi:notebook-outline',
	plus: 'mdi:plus',
	// Faker 数据生成
	account: 'mdi:account-badge-outline',
	mapMarker: 'mdi:map-marker',
	officeBuilding: 'mdi:office-building-outline',
	serverNetwork: 'mdi:server-network',
	formatText: 'mdi:format-text',
	bank: 'mdi:bank-outline',
	leaf: 'mdi:leaf',
	car: 'mdi:car',
	translate: 'mdi:translate',
	refresh: 'mdi:refresh',
	download: 'mdi:download-outline',
	file: 'mdi:file-outline',
	flag: 'mdi:flag-outline'
} as const;

export type IconKey = keyof typeof icons;

/**
 * 快捷链接图标分组注册表（图标选择浮层数据源，共 100+ 个常用图标）。
 * 名称均为 `mdi:` 前缀的 Iconify 图标，按用途分组便于查找。
 */
export const QUICK_LINK_ICON_GROUPS: QuickLinkIconGroup[] = [
	{
		label: '通用',
		options: [
			{ label: '通用链接', value: 'mdi:link' },
			{ label: '网页', value: 'mdi:web' },
			{ label: '站点 / 域名', value: 'mdi:earth' },
			{ label: '首页', value: 'mdi:home-outline' },
			{ label: '收藏', value: 'mdi:bookmark-outline' },
			{ label: '常用', value: 'mdi:star-outline' },
			{ label: '文档', value: 'mdi:file-outline' },
			{ label: '目录', value: 'mdi:folder-outline' },
			{ label: '笔记', value: 'mdi:note-text-outline' },
			{ label: '剪贴板', value: 'mdi:clipboard-text-outline' },
			{ label: '标签', value: 'mdi:tag-outline' },
			{ label: '日程', value: 'mdi:calendar-outline' },
			{ label: '地址', value: 'mdi:map-marker' },
			{ label: '邮箱', value: 'mdi:email-outline' },
			{ label: '电话', value: 'mdi:phone-outline' },
			{ label: '评论', value: 'mdi:comment-outline' },
			{ label: '论坛', value: 'mdi:forum-outline' },
			{ label: '资讯', value: 'mdi:newspaper-variant-outline' }
		]
	},
	{
		label: '开发',
		options: [
			{ label: 'GitHub', value: 'mdi:github' },
			{ label: 'GitLab', value: 'mdi:gitlab' },
			{ label: 'Bitbucket', value: 'mdi:bitbucket' },
			{ label: 'Git', value: 'mdi:git' },
			{ label: '分支', value: 'mdi:source-branch' },
			{ label: '合并', value: 'mdi:source-merge' },
			{ label: '代码', value: 'mdi:code-tags' },
			{ label: '代码块', value: 'mdi:code-braces' },
			{ label: 'JSON', value: 'mdi:code-json' },
			{ label: 'XML', value: 'mdi:xml' },
			{ label: 'Markdown', value: 'mdi:language-markdown' },
			{ label: 'JavaScript', value: 'mdi:language-javascript' },
			{ label: 'TypeScript', value: 'mdi:language-typescript' },
			{ label: 'Python', value: 'mdi:language-python' },
			{ label: 'Java', value: 'mdi:language-java' },
			{ label: 'Go', value: 'mdi:language-go' },
			{ label: 'Rust', value: 'mdi:language-rust' },
			{ label: 'PHP', value: 'mdi:language-php' },
			{ label: 'C 语言', value: 'mdi:language-c' },
			{ label: 'C++', value: 'mdi:language-cpp' },
			{ label: '终端', value: 'mdi:console' },
			{ label: '缺陷跟踪', value: 'mdi:bug-outline' },
			{ label: '依赖包', value: 'mdi:package-variant-closed' },
			{ label: 'Docker', value: 'mdi:docker' },
			{ label: 'Kubernetes', value: 'mdi:kubernetes' },
			{ label: 'npm', value: 'mdi:npm' },
			{ label: 'Node.js', value: 'mdi:nodejs' },
			{ label: 'API', value: 'mdi:api' },
			{ label: '数据库', value: 'mdi:database-outline' },
			{ label: '服务器', value: 'mdi:server' },
			{ label: '网络服务', value: 'mdi:server-network' },
			{ label: 'Stack Overflow', value: 'mdi:stack-overflow' },
			{ label: 'VS Code', value: 'mdi:visual-studio-code' },
			{ label: 'Jira', value: 'mdi:jira' },
			{ label: 'WordPress', value: 'mdi:wordpress' }
		]
	},
	{
		label: '社区 / 社交',
		options: [
			{ label: 'Telegram', value: 'mdi:telegram' },
			{ label: 'Discord', value: 'mdi:discord' },
			{ label: 'Slack', value: 'mdi:slack' },
			{ label: 'X / Twitter', value: 'mdi:twitter' },
			{ label: 'YouTube', value: 'mdi:youtube' },
			{ label: 'Twitch', value: 'mdi:twitch' },
			{ label: 'Reddit', value: 'mdi:reddit' },
			{ label: 'LinkedIn', value: 'mdi:linkedin' },
			{ label: 'Facebook', value: 'mdi:facebook' },
			{ label: 'Instagram', value: 'mdi:instagram' },
			{ label: '微信', value: 'mdi:wechat' },
			{ label: 'QQ', value: 'mdi:qqchat' },
			{ label: 'Mastodon', value: 'mdi:mastodon' },
			{ label: 'WhatsApp', value: 'mdi:whatsapp' },
			{ label: 'Skype', value: 'mdi:skype' },
			{ label: 'Medium', value: 'mdi:medium' },
			{ label: 'DEV', value: 'mdi:dev-to' },
			{ label: 'Teams', value: 'mdi:microsoft-teams' },
			{ label: 'RSS', value: 'mdi:rss' },
			{ label: '播客', value: 'mdi:podcast' }
		]
	},
	{
		label: '平台 / 厂商',
		options: [
			{ label: 'Apple', value: 'mdi:apple' },
			{ label: 'Linux', value: 'mdi:linux' },
			{ label: 'Windows', value: 'mdi:windows' },
			{ label: 'Android', value: 'mdi:android' },
			{ label: 'Firefox', value: 'mdi:firefox' },
			{ label: 'Chrome', value: 'mdi:google-chrome' },
			{ label: 'Edge', value: 'mdi:microsoft-edge' },
			{ label: 'Vue', value: 'mdi:vuejs' },
			{ label: 'React', value: 'mdi:react' },
			{ label: 'Angular', value: 'mdi:angular' },
			{ label: 'Tailwind CSS', value: 'mdi:tailwind' },
			{ label: 'Sass', value: 'mdi:sass' },
			{ label: 'jQuery', value: 'mdi:jquery' }
		]
	},
	{
		label: '系统 / 硬件',
		options: [
			{ label: '云服务', value: 'mdi:cloud-outline' },
			{ label: '云上传', value: 'mdi:cloud-upload-outline' },
			{ label: '硬盘', value: 'mdi:harddisk' },
			{ label: '内存', value: 'mdi:memory' },
			{ label: 'CPU', value: 'mdi:cpu-64-bit' },
			{ label: '安全', value: 'mdi:shield-lock-outline' },
			{ label: '密钥', value: 'mdi:key-outline' },
			{ label: '锁', value: 'mdi:lock-outline' },
			{ label: 'Wi-Fi', value: 'mdi:wifi' },
			{ label: '有线网络', value: 'mdi:ethernet' },
			{ label: 'VPN', value: 'mdi:vpn' },
			{ label: '指纹', value: 'mdi:fingerprint' },
			{ label: '证书', value: 'mdi:certificate-outline' }
		]
	},
	{
		label: '其他',
		options: [
			{ label: '图片', value: 'mdi:image-outline' },
			{ label: '视频', value: 'mdi:video-outline' },
			{ label: '音乐', value: 'mdi:music' },
			{ label: '相机', value: 'mdi:camera-outline' },
			{ label: '游戏', value: 'mdi:gamepad-variant-outline' },
			{ label: '咖啡', value: 'mdi:coffee' },
			{ label: '自然', value: 'mdi:leaf' },
			{ label: '发布', value: 'mdi:rocket-launch-outline' },
			{ label: '灵感', value: 'mdi:lightbulb-on-outline' },
			{ label: '图表', value: 'mdi:chart-line' },
			{ label: '演示', value: 'mdi:presentation' },
			{ label: '文档库', value: 'mdi:book-open-variant' },
			{ label: '教育', value: 'mdi:school-outline' },
			{ label: '工作', value: 'mdi:briefcase-outline' },
			{ label: '购物车', value: 'mdi:cart-outline' },
			{ label: '信用卡', value: 'mdi:credit-card-outline' },
			{ label: '银行', value: 'mdi:bank-outline' },
			{ label: '礼物', value: 'mdi:gift-outline' },
			{ label: '奖杯', value: 'mdi:trophy-outline' },
			{ label: '工具', value: 'mdi:tools' },
			{ label: '设置', value: 'mdi:cog-outline' },
			{ label: '实验', value: 'mdi:flask-outline' },
			{ label: '计算器', value: 'mdi:calculator-variant-outline' },
			{ label: 'A/B 测试', value: 'mdi:ab-testing' },
			{ label: '站点地图', value: 'mdi:sitemap-outline' },
			{ label: '归档', value: 'mdi:archive-outline' },
			{ label: '工单', value: 'mdi:ticket-outline' },
			{ label: '下载', value: 'mdi:download-outline' },
			{ label: '上传', value: 'mdi:upload-outline' },
			{ label: '分享', value: 'mdi:share-variant-outline' },
			{ label: '外链', value: 'mdi:open-in-new' },
			{ label: '旗帜', value: 'mdi:flag-outline' },
			{ label: '热门', value: 'mdi:fire' },
			{ label: 'AI', value: 'mdi:brain' },
			{ label: '机器人', value: 'mdi:robot-outline' },
			{ label: '翻译', value: 'mdi:translate' }
		]
	}
];

/** 快捷链接图标扁平列表（供默认值等场景使用） */
export const QUICK_LINK_ICONS: QuickLinkIconOption[] = QUICK_LINK_ICON_GROUPS.flatMap((group) => group.options);
