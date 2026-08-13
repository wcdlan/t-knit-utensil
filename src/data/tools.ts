import type { Tool, ToolGroup } from '@/types/tools';
import { icons } from '@/data/icons';

export type { Tool, ToolGroup };

export const toolGroups: ToolGroup[] = [
	{
		id: 'codec',
		name: '编解码',
		icon: icons.lock,
		tools: [
			{ id: 'base64', name: 'Base64', description: 'Base64 编码与解码', icon: icons.pencil },
			{ id: 'url-encode', name: 'URL 编解码', description: 'URL 编码与解码转换', icon: icons.link },
			{ id: 'unicode', name: 'Unicode', description: 'Unicode 与中文互转', icon: icons.web },
			{
				id: 'encoding',
				name: '编码探测',
				description: '文本在不同编码间的转换与乱码测试，支持 UTF-8/GBK/Big5 等',
				icon: icons.encoding
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
			{ id: 'sql-formatter', name: 'SQL 格式化', description: 'SQL 语句格式化', icon: icons.database }
		]
	},
	{
		id: 'converter',
		name: '数据转换',
		icon: icons.swap,
		tools: [
			{ id: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期互转', icon: icons.clock },
			{ id: 'color', name: '颜色转换', description: 'HEX/RGB/HSL 颜色格式互转', icon: icons.palette }
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
			{ id: 'password', name: '密码生成', description: '随机安全密码生成', icon: icons.key }
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
				id: 'license-selector',
				name: '开源许可证选择',
				description: '通过问答匹配最适合的开源许可证，支持协议细览、复制与下载',
				icon: icons.script
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
