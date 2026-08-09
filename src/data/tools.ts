export interface Tool {
    id: string
    name: string
    description: string
    icon: string
}

export interface ToolGroup {
    id: string
    name: string
    icon: string
    tools: Tool[]
}

export const toolGroups: ToolGroup[] = [
    {
        id: 'encode-decode',
        name: '编解码',
        icon: '🔐',
        tools: [
            {id: 'base64', name: 'Base64', description: 'Base64 编码与解码', icon: '📝'},
            {id: 'url-encode', name: 'URL 编解码', description: 'URL 编码与解码转换', icon: '🔗'},
            {id: 'unicode', name: 'Unicode', description: 'Unicode 与中文互转', icon: '🌐'},
        ],
    },
    {
        id: 'formatter',
        name: '格式化',
        icon: '✨',
        tools: [
            {id: 'json-formatter', name: 'JSON 格式化', description: 'JSON 格式化、压缩与校验', icon: '📋'},
            {id: 'sql-formatter', name: 'SQL 格式化', description: 'SQL 语句格式化', icon: '🗄️'},
        ],
    },
    {
        id: 'converter',
        name: '转换器',
        icon: '🔄',
        tools: [
            {id: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期互转', icon: '⏰'},
            {id: 'color', name: '颜色转换', description: 'HEX/RGB/HSL 颜色格式互转', icon: '🎨'},
        ],
    },
    {
        id: 'generator',
        name: '生成器',
        icon: '⚡',
        tools: [
            {id: 'uuid', name: 'UUID 生成器', description: '生成 UUID v1/v4', icon: '🆔'},
            {id: 'hash', name: '哈希计算', description: 'MD5 / SHA 系列哈希计算', icon: '🔒'},
            {id: 'qrcode', name: '二维码生成', description: '在线生成二维码', icon: '📱'},
            {id: 'password', name: '密码生成', description: '随机安全密码生成', icon: '🔑'},
        ],
    },
    {
        id: 'text-tools',
        name: '文本工具',
        icon: '📝',
        tools: [
            {id: 'regex', name: '正则测试', description: '正则表达式在线测试', icon: '🔍'},
            {id: 'diff', name: '文本对比', description: '文本差异对比工具', icon: '📊'},
            {id: 'word-count', name: '字数统计', description: '字符/单词/行数统计', icon: '📏'},
        ],
    },
]

export function getToolById(id: string): Tool | undefined {
    for (const group of toolGroups) {
        const tool = group.tools.find((t) => t.id === id)
        if (tool) return tool
    }
}
