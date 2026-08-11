import type { Tool, ToolGroup } from '@/types/tools';

export type { Tool, ToolGroup };

export const toolGroups: ToolGroup[] = [
	{
		id: 'codec',
		name: '编解码',
		icon: '🔐',
		tools: [
			{ id: 'base64', name: 'Base64', description: 'Base64 编码与解码', icon: '📝' },
			{ id: 'url-encode', name: 'URL 编解码', description: 'URL 编码与解码转换', icon: '🔗' },
			{ id: 'unicode', name: 'Unicode', description: 'Unicode 与中文互转', icon: '🌐' }
		]
	},
	{
		id: 'formatter',
		name: '格式化',
		icon: '✨',
		tools: [
			{
				id: 'json-formatter',
				name: 'JSON 格式化',
				description: 'JSON 格式化、压缩与校验',
				icon: '📋'
			},
			{ id: 'sql-formatter', name: 'SQL 格式化', description: 'SQL 语句格式化', icon: '🗄️' }
		]
	},
	{
		id: 'converter',
		name: '数据转换',
		icon: '🔄',
		tools: [
			{ id: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期互转', icon: '⏰' },
			{ id: 'color', name: '颜色转换', description: 'HEX/RGB/HSL 颜色格式互转', icon: '🎨' }
		]
	},
	{
		id: 'generator',
		name: '数据生成',
		icon: '⚡',
		tools: [
			{ id: 'uuid', name: 'UUID 生成器', description: '生成 UUID v1/v4', icon: '🆔' },
			{ id: 'hash', name: '哈希计算', description: 'MD5 / SHA 系列哈希计算', icon: '🔒' },
			{ id: 'qrcode', name: '二维码生成', description: '在线生成二维码', icon: '📱' },
			{ id: 'password', name: '密码生成', description: '随机安全密码生成', icon: '🔑' }
		]
	},
	{
		id: 'ssh',
		name: 'OpenSSH',
		icon: '🔑',
		tools: [
			{
				id: 'ssh-keygen',
				name: '密钥对生成',
				description: '生成 RSA / ECDSA 密钥对，支持密码与注释',
				icon: '🔐'
			}
		]
	},
	{
		id: 'image',
		name: '图片工具',
		icon: '🖼️',
		tools: [
			{
				id: 'favicon',
				name: 'Favicon 生成器',
				description: '上传图片裁剪生成多尺寸 Favicon，支持 PNG/ICO 格式与 ZIP 打包下载',
				icon: '🎯'
			}
		]
	},
	{
		id: 'text',
		name: '文本工具',
		icon: '📝',
		tools: [
			{ id: 'regex', name: '正则测试', description: '正则表达式在线测试', icon: '🔍' },
			{ id: 'diff', name: '文本对比', description: '文本差异对比工具', icon: '📊' },
			{ id: 'word-count', name: '字数统计', description: '字符/单词/行数统计', icon: '📏' }
		]
	},
	{
		id: 'ai',
		name: 'AI 工具',
		icon: '🤖',
		tools: [
			{
				id: 'ai-tester',
				name: 'AI API 测试',
				description:
					'测试 AI API 连接与 Key 可用性，支持 OpenAI / Anthropic / Gemini 格式，查看可用模型列表并发送测试对话',
				icon: '🧪'
			}
		]
	},
	{
		id: 'common',
		name: '常用工具',
		icon: '🧰',
		tools: [
			{
				id: 'license-selector',
				name: '开源许可证选择',
				description: '通过问答匹配最适合的开源许可证，支持协议细览、复制与下载',
				icon: '📜'
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
