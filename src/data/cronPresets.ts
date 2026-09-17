import type { CronPreset } from '@/types/cron';

/** 常用 cron 表达式库（按场景分组，供「常用 cron 列表」页签展示与一键载入） */
export const cronPresets: CronPreset[] = [
	// 高频周期
	{ expression: '* * * * *', name: '每分钟', category: '高频周期', description: '每分钟执行一次，最基础的高频写法' },
	{ expression: '*/2 * * * *', name: '每 2 分钟', category: '高频周期', description: '每 2 分钟执行一次' },
	{ expression: '*/5 * * * *', name: '每 5 分钟', category: '高频周期', description: '常见的监控采集 / 心跳间隔' },
	{ expression: '*/10 * * * *', name: '每 10 分钟', category: '高频周期', description: '每 10 分钟执行一次' },
	{
		expression: '*/15 * * * *',
		name: '每 15 分钟',
		category: '高频周期',
		description: '每刻钟执行一次，常用于缓存刷新'
	},
	{ expression: '*/30 * * * *', name: '每 30 分钟', category: '高频周期', description: '每半小时执行一次' },
	{
		expression: '0,30 * * * *',
		name: '整点与半点',
		category: '高频周期',
		description: '每小时的第 0 分与第 30 分执行'
	},
	{
		expression: '0 */6 * * *',
		name: '每 6 小时',
		category: '高频周期',
		description: '零点起每 6 小时执行一次（0 / 6 / 12 / 18 点整）'
	},
	{ expression: '0 * * * *', name: '每小时整点', category: '高频周期', description: '每小时的第 0 分执行' },
	{ expression: '30 * * * *', name: '每小时 30 分', category: '高频周期', description: '每小时的第 30 分执行' },

	// 每日固定时刻
	{
		expression: '0 0 * * *',
		name: '每天零点',
		category: '每日固定时刻',
		description: '每天 00:00 执行，等价于 @daily'
	},
	{
		expression: '0 2 * * *',
		name: '每天凌晨 2 点',
		category: '每日固定时刻',
		description: '每天 02:00 执行，常用于离线批处理'
	},
	{
		expression: '30 2 * * *',
		name: '每天凌晨 2:30',
		category: '每日固定时刻',
		description: '每天 02:30 执行，避开整点高峰（默认示例）'
	},
	{
		expression: '30 3 * * *',
		name: '每天凌晨 3:30',
		category: '每日固定时刻',
		description: '每天 03:30 执行，常用于数据库备份'
	},
	{
		expression: '0 8 * * *',
		name: '每天早 8 点',
		category: '每日固定时刻',
		description: '每天 08:00 执行，常用于早间报表推送'
	},
	{
		expression: '0 9 * * *',
		name: '每天上午 9 点',
		category: '每日固定时刻',
		description: '每天 09:00 执行，常用于考勤 / 打卡统计'
	},
	{ expression: '0 12 * * *', name: '每天中午 12 点', category: '每日固定时刻', description: '每天 12:00 执行' },
	{
		expression: '0 18 * * *',
		name: '每天傍晚 18 点',
		category: '每日固定时刻',
		description: '每天 18:00 执行，常用于下班前汇总'
	},
	{
		expression: '0 23 * * *',
		name: '每天 23 点',
		category: '每日固定时刻',
		description: '每天 23:00 执行，常用于日终结算'
	},
	{
		expression: '0 0,12 * * *',
		name: '每天零点与中午',
		category: '每日固定时刻',
		description: '每天 00:00 与 12:00 各执行一次'
	},

	// 工作日与周末
	{
		expression: '0 9 * * 1-5',
		name: '工作日早 9 点',
		category: '工作日与周末',
		description: '周一到周五 09:00 执行，常见于工作日提醒'
	},
	{
		expression: '0 18 * * 1-5',
		name: '工作日晚 18 点',
		category: '工作日与周末',
		description: '周一到周五 18:00 执行'
	},
	{
		expression: '0 9 * * 1',
		name: '每周一早 9 点',
		category: '工作日与周末',
		description: '每周一 09:00 执行，常见于周报 / 周会提醒'
	},
	{
		expression: '0 10 * * 1,3,5',
		name: '周一三五上午 10 点',
		category: '工作日与周末',
		description: '每周一、三、五 10:00 执行'
	},
	{ expression: '0 10 * * 6', name: '每周六上午 10 点', category: '工作日与周末', description: '每周六 10:00 执行' },
	{ expression: '0 9 * * 0', name: '每周日早 9 点', category: '工作日与周末', description: '每周日 09:00 执行' },
	{
		expression: '0 2 * * 6,0',
		name: '周末凌晨 2 点',
		category: '工作日与周末',
		description: '每周六、周日 02:00 执行，适合周末全量任务'
	},
	{
		expression: '0 9 * * 5#2',
		name: '每月第二个周五 9 点',
		category: '工作日与周末',
		description: '当月第二个周五 09:00 执行（# 为 Quartz 扩展语法）'
	},

	// 每月计划
	{ expression: '0 0 1 * *', name: '每月 1 号零点', category: '每月计划', description: '每月 1 日 00:00 执行' },
	{
		expression: '0 2 1 * *',
		name: '每月 1 号凌晨 2 点',
		category: '每月计划',
		description: '每月 1 日 02:00 执行，常用于月账单生成'
	},
	{
		expression: '0 0 15 * *',
		name: '每月 15 号零点',
		category: '每月计划',
		description: '每月 15 日 00:00 执行，常用于月中对账'
	},
	{
		expression: '0 0 1,15 * *',
		name: '每月 1 号与 15 号',
		category: '每月计划',
		description: '每月 1 日与 15 日 00:00 各执行一次'
	},
	{
		expression: '0 0 L * *',
		name: '每月最后一天',
		category: '每月计划',
		description: '每月最后一天 00:00 执行（L 表示最后一天）'
	},
	{
		expression: '0 3 L * *',
		name: '每月最后一天凌晨 3 点',
		category: '每月计划',
		description: '每月最后一天 03:00 执行，适合月末归档'
	},
	{
		expression: '0 0 1 1 *',
		name: '每年 1 月 1 日',
		category: '每月计划',
		description: '每年 1 月 1 日 00:00 执行，常用于年度初始化'
	},
	{
		expression: '0 0 1 */3 *',
		name: '每季度首日',
		category: '每月计划',
		description: '每 3 个月的第一天 00:00 执行（1 / 4 / 7 / 10 月）'
	},

	// 秒级（6 段）
	{
		expression: '*/30 * * * * *',
		name: '每 30 秒',
		category: '秒级（6 段）',
		description: '每 30 秒执行一次，需要支持秒字段的调度器（Quartz 等）'
	},
	{
		expression: '0 * * * * *',
		name: '每分钟整点（秒级）',
		category: '秒级（6 段）',
		description: '每分钟的第 0 秒执行，等价于 5 段式每分钟'
	},
	{
		expression: '0 0 12 * * ?',
		name: '每天中午 12 点（Quartz）',
		category: '秒级（6 段）',
		description: 'Quartz 风格：? 占位日字段，每天 12:00:00 触发'
	},
	{
		expression: '0 15 10 ? * MON-FRI',
		name: '工作日 10:15（Quartz）',
		category: '秒级（6 段）',
		description: 'Quartz 风格：周一到周五 10:15:00 触发'
	},
	{
		expression: '0 0/5 14,18 * * ?',
		name: '下午每 5 分钟（Quartz）',
		category: '秒级（6 段）',
		description: 'Quartz 风格：每天 14:00-14:55 与 18:00-18:55 每 5 分钟触发'
	},

	// 别名与间隔
	{
		expression: '@reboot',
		name: '开机启动',
		category: '别名与间隔',
		description: '系统启动时执行一次（仅 crond 支持）'
	},
	{
		expression: '@yearly',
		name: '每年一次',
		category: '别名与间隔',
		description: '等价于 0 0 1 1 *，即每年 1 月 1 日零点'
	},
	{
		expression: '@monthly',
		name: '每月一次',
		category: '别名与间隔',
		description: '等价于 0 0 1 * *，即每月 1 日零点'
	},
	{ expression: '@weekly', name: '每周一次', category: '别名与间隔', description: '等价于 0 0 * * 0，即每周日零点' },
	{ expression: '@daily', name: '每天一次', category: '别名与间隔', description: '等价于 0 0 * * *，即每天零点' },
	{ expression: '@hourly', name: '每小时一次', category: '别名与间隔', description: '等价于 0 * * * *，即每小时整点' },
	{
		expression: '@every 30m',
		name: '每 30 分钟（间隔式）',
		category: '别名与间隔',
		description: 'Go / 部分调度器支持的间隔写法'
	}
];

/** 常用表达式库的分组顺序（页签展示顺序） */
export const cronPresetCategories: string[] = [...new Set(cronPresets.map((item) => item.category))];
