// 路由追踪工具静态数据（示例目标 / 配置选项说明）

import type { SelectOption } from 'naive-ui';

/** 常用示例目标（点击即可填入输入框） */
export const TRACE_EXAMPLES: string[] = ['example.com', 'www.baidu.com', '8.8.8.8', 'github.com'];

/** 最大跳数选项（跳数越多越能追踪远端路径，但无响应目标耗时更长） */
export const TRACE_MAX_HOP_OPTIONS: SelectOption[] = [
	{ label: '10 跳', value: 10 },
	{ label: '15 跳', value: 15 },
	{ label: '20 跳', value: 20 },
	{ label: '25 跳', value: 25 },
	{ label: '30 跳', value: 30 }
];

/** 每跳探测次数选项（多次探测可观察抖动与负载均衡） */
export const TRACE_PROBE_OPTIONS: SelectOption[] = [
	{ label: '1 次（最快）', value: 1 },
	{ label: '2 次', value: 2 },
	{ label: '3 次（最详细）', value: 3 }
];
