import type { ObfuscationPreset, ObfuscatorOptionGroup, ObfuscatorOptions } from '@/types/jsObfuscator';

/** 混淆选项分组（按功能归类展示全部选项） */
export const obfuscatorOptionGroups: ObfuscatorOptionGroup[] = [
	{
		id: 'output',
		name: '输出与目标',
		options: [
			{
				key: 'compact',
				label: '压缩输出',
				description: '将混淆后的代码压缩为尽量少的空格与换行',
				type: 'boolean'
			},
			{
				key: 'target',
				label: '运行环境',
				description: '目标运行环境，影响生成代码的语法特性',
				type: 'select',
				options: [
					{ label: '浏览器（默认）', value: 'browser' },
					{ label: '浏览器（禁用 eval）', value: 'browser-no-eval' },
					{ label: 'Node.js', value: 'node' }
				]
			},
			{
				key: 'seed',
				label: '随机种子',
				description: '固定随机数种子，相同输入可生成一致的混淆结果',
				type: 'number',
				min: 0,
				step: 1
			},
			{
				key: 'log',
				label: '输出日志',
				description: '混淆过程中输出日志信息（浏览器端仅在控制台可见）',
				type: 'boolean'
			},
			{
				key: 'inputFileName',
				label: '输入文件名',
				description: '源文件名，用于 Source Map 关联（一般可留空）',
				type: 'string',
				placeholder: '如：index.js'
			},
			{
				key: 'sourceMap',
				label: '生成 Source Map',
				description: '生成源代码映射文件，便于调试混淆后的代码',
				type: 'boolean'
			},
			{
				key: 'sourceMapMode',
				label: 'Source Map 模式',
				description: '独立文件输出或内联到代码中',
				type: 'select',
				options: [
					{ label: '独立文件', value: 'separate' },
					{ label: '内联', value: 'inline' }
				]
			},
			{
				key: 'sourceMapBaseUrl',
				label: 'Source Map 基础 URL',
				description: 'Source Map 文件的公共基础地址',
				type: 'string',
				placeholder: '如：https://example.com/dist'
			},
			{
				key: 'sourceMapFileName',
				label: 'Source Map 文件名',
				description: '生成的 Source Map 文件名',
				type: 'string',
				placeholder: '如：index.js.map'
			},
			{
				key: 'sourceMapSourcesMode',
				label: 'Source Map 源码模式',
				description: '是否在映射中包含源码内容',
				type: 'select',
				options: [
					{ label: '包含源码内容', value: 'sources-content' },
					{ label: '仅源码路径', value: 'sources' }
				]
			}
		]
	},
	{
		id: 'identifier',
		name: '标识符',
		options: [
			{
				key: 'identifierNamesGenerator',
				label: '标识符命名方式',
				description: '混淆后变量/函数名的生成策略',
				type: 'select',
				options: [
					{ label: '十六进制', value: 'hexadecimal' },
					{ label: 'mangled（a、b、c…）', value: 'mangled' },
					{ label: 'mangled-shuffled（随机乱序）', value: 'mangled-shuffled' }
				]
			},
			{
				key: 'identifiersPrefix',
				label: '标识符前缀',
				description: '为混淆后的标识符添加统一前缀',
				type: 'string',
				placeholder: '如：_0x'
			},
			{
				key: 'identifiersDictionary',
				label: '标识符字典',
				description: '自定义标识符候选词，混淆时从中挑选名称',
				type: 'string-array',
				placeholder: '输入后回车添加'
			},
			{
				key: 'renameGlobals',
				label: '重命名全局变量',
				description: '重命名顶层声明的变量与函数（可能破坏外部引用）',
				type: 'boolean'
			},
			{
				key: 'renameProperties',
				label: '重命名属性',
				description: '重命名对象属性名，需配合属性重命名模式使用',
				type: 'boolean'
			},
			{
				key: 'renamePropertiesMode',
				label: '属性重命名模式',
				description: 'safe 仅重命名未引用字符串的属性；unsafe 更彻底但可能出错',
				type: 'select',
				options: [
					{ label: 'safe（安全）', value: 'safe' },
					{ label: 'unsafe（激进）', value: 'unsafe' }
				]
			},
			{
				key: 'ignoreImports',
				label: '忽略 import',
				description: '不混淆 import 语句（保留 ESM 模块导入）',
				type: 'boolean'
			},
			{
				key: 'reservedNames',
				label: '保留的标识符',
				description: '这些名称的变量/函数不会被重命名',
				type: 'string-array',
				placeholder: '输入后回车添加'
			},
			{
				key: 'reservedStrings',
				label: '保留的字符串',
				description: '这些字符串不会被转换与加密',
				type: 'string-array',
				placeholder: '输入后回车添加'
			}
		]
	},
	{
		id: 'string-array',
		name: '字符串数组',
		options: [
			{
				key: 'stringArray',
				label: '字符串数组',
				description: '将字符串收集到数组中统一解密调用（混淆核心特性）',
				type: 'boolean'
			},
			{
				key: 'stringArrayThreshold',
				label: '字符串数组阈值',
				description: '被移入字符串数组的字符串比例（0~1）',
				type: 'number',
				min: 0,
				max: 1,
				step: 0.05
			},
			{
				key: 'stringArrayEncoding',
				label: '字符串数组编码',
				description: '对数组内容进行编码加密，增强逆向难度',
				type: 'multi-select',
				options: [
					{ label: '不编码', value: 'none' },
					{ label: 'Base64', value: 'base64' },
					{ label: 'RC4', value: 'rc4' }
				]
			},
			{
				key: 'stringArrayIndexesType',
				label: '数组索引类型',
				description: '访问数组时索引的表达方式',
				type: 'multi-select',
				options: [
					{ label: '十六进制数字', value: 'hexadecimal-number' },
					{ label: '十六进制数字字符串', value: 'hexadecimal-numeric-string' }
				]
			},
			{
				key: 'stringArrayIndexShift',
				label: '索引移位',
				description: '混淆数组索引的读取位置（自校验逻辑）',
				type: 'boolean'
			},
			{
				key: 'stringArrayRotate',
				label: '数组轮转',
				description: '初始化时旋转数组顺序，提高逆向难度',
				type: 'boolean'
			},
			{
				key: 'stringArrayShuffle',
				label: '数组乱序',
				description: '打乱数组中元素的顺序',
				type: 'boolean'
			},
			{
				key: 'stringArrayCallsTransform',
				label: '调用方式转换',
				description: '将数组读取函数调用转换为更隐蔽的调用链',
				type: 'boolean'
			},
			{
				key: 'stringArrayCallsTransformThreshold',
				label: '调用转换阈值',
				description: '被转换的调用比例（0~1）',
				type: 'number',
				min: 0,
				max: 1,
				step: 0.05
			},
			{
				key: 'stringArrayWrappersChainedCalls',
				label: '包装器链式调用',
				description: '包装器之间使用链式调用，增加分析难度',
				type: 'boolean'
			},
			{
				key: 'stringArrayWrappersCount',
				label: '包装器数量',
				description: '包装数组读取的辅助函数数量（越多越复杂）',
				type: 'number',
				min: 1,
				step: 1
			},
			{
				key: 'stringArrayWrappersParametersMaxCount',
				label: '包装器参数上限',
				description: '包装函数可接收的最大参数个数',
				type: 'number',
				min: 1,
				step: 1
			},
			{
				key: 'stringArrayWrappersType',
				label: '包装器类型',
				description: '包装函数的表现形式',
				type: 'select',
				options: [
					{ label: '变量', value: 'variable' },
					{ label: '函数', value: 'function' }
				]
			},
			{
				key: 'forceTransformStrings',
				label: '强制转换的字符串',
				description: '这些字符串无论长度都会被移入字符串数组',
				type: 'string-array',
				placeholder: '输入后回车添加'
			}
		]
	},
	{
		id: 'control-flow',
		name: '控制流',
		options: [
			{
				key: 'controlFlowFlattening',
				label: '控制流平坦化',
				description: '将线性代码转为 switch 分发的循环结构，大幅提高阅读难度',
				type: 'boolean'
			},
			{
				key: 'controlFlowFlatteningThreshold',
				label: '平坦化阈值',
				description: '被平坦化的代码比例（0~1），仅控制流平坦化开启时生效',
				type: 'number',
				min: 0,
				max: 1,
				step: 0.05
			},
			{
				key: 'deadCodeInjection',
				label: '死代码注入',
				description: '注入大量不可达的假代码块，迷惑分析者',
				type: 'boolean'
			},
			{
				key: 'deadCodeInjectionThreshold',
				label: '死代码阈值',
				description: '注入死代码的比例（0~1），仅死代码注入开启时生效',
				type: 'number',
				min: 0,
				max: 1,
				step: 0.05
			},
			{
				key: 'numbersToExpressions',
				label: '数字转表达式',
				description: '将数字常量转换为算术表达式（如 0x1a → 0x1d-0x3）',
				type: 'boolean'
			},
			{
				key: 'transformObjectKeys',
				label: '对象键名转换',
				description: '将对象键名提取为变量，隐藏键名含义',
				type: 'boolean'
			},
			{
				key: 'splitStrings',
				label: '字符串拆分',
				description: '将长字符串拆分为多个片段拼接，增加还原难度',
				type: 'boolean'
			},
			{
				key: 'splitStringsChunkLength',
				label: '拆分块长度',
				description: '拆分后每段字符串的最大长度',
				type: 'number',
				min: 1,
				step: 1
			},
			{
				key: 'simplify',
				label: '语法简化',
				description: '简化无用的语法结构（三元表达式、布尔运算等）',
				type: 'boolean'
			},
			{
				key: 'unicodeEscapeSequence',
				label: 'Unicode 转义',
				description: '将标识符与字符串转为 \\uXXXX 转义序列',
				type: 'boolean'
			}
		]
	},
	{
		id: 'defense',
		name: '反调试',
		options: [
			{
				key: 'debugProtection',
				label: '调试保护',
				description: '检测开发者工具打开并阻止调试（卡死调试器）',
				type: 'boolean'
			},
			{
				key: 'debugProtectionInterval',
				label: '调试保护间隔',
				description: '持续检测调试器的间隔毫秒数，0 表示仅检测一次',
				type: 'number',
				min: 0,
				step: 500
			},
			{
				key: 'selfDefending',
				label: '自防御',
				description: '代码被格式化后自动失效，防止还原美化',
				type: 'boolean'
			},
			{
				key: 'disableConsoleOutput',
				label: '禁用控制台输出',
				description: '覆盖 console 方法，静默丢弃日志输出',
				type: 'boolean'
			},
			{
				key: 'domainLock',
				label: '域名锁定',
				description: '仅在指定域名下运行，其他域名返回空代码',
				type: 'string-array',
				placeholder: '输入后回车添加，如：example.com'
			},
			{
				key: 'domainLockRedirectUrl',
				label: '域名锁定跳转地址',
				description: '域名不匹配时跳转到的 URL',
				type: 'string',
				placeholder: '如：https://example.com/error'
			}
		]
	}
];

/** default 预设的完整选项值（作为所有预设的基础） */
export const defaultObfuscatorOptions: ObfuscatorOptions = {
	compact: true,
	controlFlowFlattening: false,
	controlFlowFlatteningThreshold: 0.75,
	deadCodeInjection: false,
	deadCodeInjectionThreshold: 0.4,
	debugProtection: false,
	debugProtectionInterval: 0,
	disableConsoleOutput: false,
	domainLock: [],
	domainLockRedirectUrl: 'about:blank',
	forceTransformStrings: [],
	identifierNamesGenerator: 'hexadecimal',
	identifiersDictionary: [],
	identifiersPrefix: '',
	ignoreImports: false,
	inputFileName: '',
	log: false,
	numbersToExpressions: false,
	renameGlobals: false,
	renameProperties: false,
	renamePropertiesMode: 'safe',
	reservedNames: [],
	reservedStrings: [],
	seed: 0,
	selfDefending: false,
	simplify: true,
	sourceMap: false,
	sourceMapBaseUrl: '',
	sourceMapFileName: '',
	sourceMapMode: 'separate',
	sourceMapSourcesMode: 'sources-content',
	splitStrings: false,
	splitStringsChunkLength: 10,
	stringArray: true,
	stringArrayCallsTransform: false,
	stringArrayCallsTransformThreshold: 0.5,
	stringArrayEncoding: ['none'],
	stringArrayIndexesType: ['hexadecimal-number'],
	stringArrayIndexShift: true,
	stringArrayRotate: true,
	stringArrayShuffle: true,
	stringArrayWrappersChainedCalls: true,
	stringArrayWrappersCount: 1,
	stringArrayWrappersParametersMaxCount: 2,
	stringArrayWrappersType: 'variable',
	stringArrayThreshold: 0.75,
	target: 'browser',
	transformObjectKeys: false,
	unicodeEscapeSequence: false
};

/** 混淆预设定义（低混淆为默认推荐） */
export const obfuscationPresets: ObfuscationPreset[] = [
	{
		key: 'low-obfuscation',
		name: '低混淆',
		description: '适合日常保护，代码体积增长小，运行性能影响低',
		overrides: {
			disableConsoleOutput: true,
			selfDefending: true,
			stringArrayCallsTransformThreshold: 0
		}
	},
	{
		key: 'medium-obfuscation',
		name: '中混淆',
		description: '在安全性与性能之间取得平衡，代码显著复杂化',
		overrides: {
			controlFlowFlattening: true,
			deadCodeInjection: true,
			disableConsoleOutput: true,
			numbersToExpressions: true,
			selfDefending: true,
			splitStrings: true,
			stringArrayCallsTransformThreshold: 0.75,
			stringArrayEncoding: ['base64'],
			stringArrayWrappersCount: 2,
			stringArrayWrappersParametersMaxCount: 4,
			stringArrayWrappersType: 'function',
			transformObjectKeys: true
		}
	},
	{
		key: 'high-obfuscation',
		name: '高混淆',
		description: '最大强度保护，代码体积剧增且运行变慢，适合发布版',
		overrides: {
			controlFlowFlattening: true,
			controlFlowFlatteningThreshold: 1,
			deadCodeInjection: true,
			deadCodeInjectionThreshold: 1,
			debugProtection: true,
			debugProtectionInterval: 4000,
			disableConsoleOutput: true,
			numbersToExpressions: true,
			selfDefending: true,
			splitStrings: true,
			splitStringsChunkLength: 5,
			stringArrayCallsTransformThreshold: 1,
			stringArrayEncoding: ['rc4'],
			stringArrayWrappersCount: 5,
			stringArrayWrappersParametersMaxCount: 5,
			stringArrayWrappersType: 'function',
			stringArrayThreshold: 1,
			transformObjectKeys: true
		}
	},
	{
		key: 'default',
		name: '默认',
		description: '不应用任何预设，全部选项取默认值（可自行调整）',
		overrides: {}
	}
];
