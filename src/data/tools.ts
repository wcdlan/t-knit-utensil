import type { Tool, ToolGroup } from '@/types/tools';
import { icons } from '@/data/icons';

export type { Tool, ToolGroup };

export const toolGroups: ToolGroup[] = [
	{
		id: 'codec',
		name: '编解码',
		icon: icons.lock,
		tools: [
			{ id: 'base64', name: 'Base64 编解码', description: '文本 Base64 编码与解码（轻量版）', icon: icons.pencil },
			{ id: 'url-encode', name: 'URL 编解码', description: 'URL 编码与解码转换', icon: icons.link },
			{ id: 'unicode', name: 'Unicode', description: 'Unicode 与中文互转', icon: icons.web },
			{
				id: 'encoding',
				name: '编码探测',
				description: '文本在不同编码间的转换与乱码测试，支持 UTF-8/GBK/Big5 等',
				icon: icons.encoding
			},
			{
				id: 'jwt',
				name: 'JWT 解析/生成',
				description: '解析 JWT 头部与声明、校验 HMAC 签名，或自定义声明生成 token',
				icon: icons.jwt
			}
		]
	},
	{
		id: 'formatter',
		name: '格式化',
		icon: icons.star,
		tools: [
			{
				id: 'json-formatter',
				name: 'JSON 格式化',
				description: 'JSON 格式化、压缩与校验',
				icon: icons.clipboard
			},
			{ id: 'sql-formatter', name: 'SQL 格式化', description: 'SQL 语句格式化', icon: icons.database },
			{
				id: 'case-converter',
				name: '变量名格式转换',
				description: '解析变量名并转换为 camelCase / snake_case / kebab-case 等常用格式',
				icon: icons.caseFormat
			}
		]
	},
	{
		id: 'converter',
		name: '数据转换',
		icon: icons.swap,
		tools: [
			{ id: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期互转', icon: icons.clock },
			{ id: 'color', name: '颜色转换', description: 'HEX/RGB/HSL 颜色格式互转', icon: icons.palette },
			{
				id: 'base64-converter',
				name: 'Base64 全能转换',
				description:
					'最完整的 Base64 工具：文本与任意文件（图片/文档/压缩包等）互转，支持 txt 上传拖拽、还原下载与预览',
				icon: icons.b64Converter,
				featured: true
			},
			{
				id: 'date-converter',
				name: '时间日期转换器',
				description: '自动识别任意日期格式，转换为时间戳与 ISO/RFC/中文等 20 种格式，支持输入与目标时区切换',
				icon: icons.calendarClock
			}
		]
	},
	{
		id: 'generator',
		name: '数据生成',
		icon: icons.lightning,
		tools: [
			{ id: 'uuid', name: 'UUID 生成器', description: '生成自定义版本 UUID（v1-v7）', icon: icons.identifier },
			{ id: 'hash', name: '哈希计算', description: 'MD5 / SHA 系列哈希计算', icon: icons.shieldLock },
			{ id: 'qrcode', name: '二维码生成', description: '在线生成二维码', icon: icons.qrcode },
			{ id: 'password', name: '密码生成', description: '随机安全密码生成', icon: icons.key },
			{
				id: 'faker-identity',
				name: '身份信息生成',
				description: '生成姓名/邮箱/电话等个人资料，支持多语言',
				icon: icons.account
			},
			{
				id: 'faker-address',
				name: '地址信息生成',
				description: '生成国家/城市/街道/经纬度等地址数据，支持多语言',
				icon: icons.mapMarker
			},
			{
				id: 'faker-company',
				name: '企业信息生成',
				description: '生成公司/职位/产品等企业数据，支持多语言',
				icon: icons.officeBuilding
			},
			{
				id: 'faker-network',
				name: '网络与设备生成',
				description: '生成域名/IP/MAC/UA 等网络数据',
				icon: icons.serverNetwork
			},
			{
				id: 'faker-text',
				name: '文本内容生成',
				description: '生成单词/句子/段落占位文本，支持多语言',
				icon: icons.formatText
			},
			{
				id: 'faker-finance',
				name: '金融信息生成',
				description: '生成账号/卡号/IBAN 等金融数据',
				icon: icons.bank
			},
			{
				id: 'faker-nature',
				name: '自然万物生成',
				description: '生成动物/美食/颜色/词汇词条，支持多语言',
				icon: icons.leaf
			},
			{
				id: 'faker-vehicle',
				name: '车辆信息生成',
				description: '生成车辆/VIN/车牌等车辆数据，支持多语言',
				icon: icons.car
			}
		]
	},
	{
		id: 'network',
		name: '网络工具',
		icon: icons.ipNetwork,
		tools: [
			{
				id: 'ipv4',
				name: 'IPv4 解析',
				description: '解析 IPv4 地址与 CIDR 前缀，展示掩码/网络/广播/可用主机等详细信息',
				icon: icons.ipv4
			},
			{
				id: 'ipv6',
				name: 'IPv6 解析',
				description: '解析 IPv6 地址与 CIDR 前缀，展示展开/压缩/网络/接口标识符等信息',
				icon: icons.ipv6
			},
			{
				id: 'subnet-calc',
				name: '子网计算',
				description: 'IPv4/IPv6 子网划分计算，支持自定义前缀细分并列出子网清单',
				icon: icons.subnet
			}
		]
	},
	{
		id: 'ssh',
		name: 'OpenSSH',
		icon: icons.key,
		tools: [
			{
				id: 'ssh-keygen',
				name: '密钥对生成',
				description: '生成 RSA / ECDSA 密钥对，支持密码与注释',
				icon: icons.shieldKey
			}
		]
	},
	{
		id: 'image',
		name: '图片工具',
		icon: icons.image,
		tools: [
			{
				id: 'favicon',
				name: 'Favicon 生成器',
				description: '上传图片裁剪生成多尺寸 Favicon，支持 PNG/ICO 格式与 ZIP 打包下载',
				icon: icons.target
			},
			{
				id: 'image-base64',
				name: '图片 Base64 互转',
				description: '图片专用：与 Base64 互转，支持 Data URI 头与还原下载',
				icon: icons.imageRefresh
			}
		]
	},
	{
		id: 'text',
		name: '文本工具',
		icon: icons.pencil,
		tools: [
			{ id: 'regex', name: '正则测试', description: '正则表达式在线测试', icon: icons.magnify },
			{ id: 'diff', name: '文本对比', description: '文本差异对比工具', icon: icons.chart },
			{ id: 'word-count', name: '字数统计', description: '字符/单词/行数统计', icon: icons.ruler }
		]
	},
	{
		id: 'ai',
		name: 'AI 工具',
		icon: icons.robot,
		tools: [
			{
				id: 'ai-tester',
				name: 'AI API 测试',
				description:
					'测试 AI API 连接与 Key 可用性，支持 OpenAI / Anthropic / Gemini 格式，查看可用模型列表并发送测试对话',
				icon: icons.testTube
			}
		]
	},
	{
		id: 'common',
		name: '常用工具',
		icon: icons.toolbox,
		tools: [
			{
				id: 'js-obfuscator',
				name: 'JS 混淆',
				description: 'JavaScript 代码混淆加密，支持低/中/高三档预设与全部选项微调',
				icon: icons.shuffle
			},
			{
				id: 'license-selector',
				name: '开源许可证选择',
				description: '通过问答匹配最适合的开源许可证，支持协议细览、复制与下载',
				icon: icons.script
			},
			{
				id: 'keyboard-tester',
				name: '键盘测试',
				description: '完整键盘模型按键测试，展示 KeyCode / APM / 输入历史，支持组合键与 Win / Mac 布局切换',
				icon: icons.keyboard
			},
			{
				id: 'browser-info',
				name: '浏览器信息',
				description: '查看浏览器版本与内核、系统硬件、屏幕视口、网络与公网 IP、存储配额、电池及 50+ 项 Web 能力检测',
				icon: icons.monitor
			}
		]
	},
	{
		id: 'virtualization',
		name: '虚拟化工具',
		icon: icons.flag,
		tools: [
			{
				id: 'virtio-download',
				name: 'VirtIO 驱动下载',
				description: '浏览并下载 Fedora VirtIO 驱动（ISO/RPM/MSI/EXE），支持多版本归档',
				icon: icons.download
			}
		]
	}
];

export function getToolById(id: string): Tool | undefined {
	for (const group of toolGroups) {
		const tool = group.tools.find((t) => t.id === id);
		if (tool) return tool;
	}
}
