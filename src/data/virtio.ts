// VirtIO 驱动各 Windows 系统推荐版本关系（静态数据）
// 规则：能用最新版就推荐最新版；不能用最新版的旧系统推荐归档中仍可用的最合适版本。
import type { VirtioOsRecommendation } from '@/types/virtio';

export const VIRTIO_OS_RECOMMENDATIONS: VirtioOsRecommendation[] = [
	{ osName: 'Windows 11', useLatest: true, recommended: [] },
	{ osName: 'Windows 10', useLatest: true, recommended: [] },
	{ osName: 'Windows Server 2025', useLatest: true, recommended: [] },
	{ osName: 'Windows Server 2022', useLatest: true, recommended: [] },
	{ osName: 'Windows Server 2019', useLatest: true, recommended: [] },
	{ osName: 'Windows Server 2016', useLatest: true, recommended: [] },
	{ osName: 'Windows 8.1', useLatest: false, recommended: ['0.1.185'] },
	{ osName: 'Windows 8', useLatest: false, recommended: ['0.1.190', '0.1.185'] },
	{ osName: 'Windows Server 2012 R2', useLatest: false, recommended: ['0.1.185'] },
	{ osName: 'Windows Server 2012', useLatest: false, recommended: ['0.1.190', '0.1.185'] },
	{ osName: 'Windows 7', useLatest: false, recommended: ['0.1.190', '0.1.172'] },
	{ osName: 'Windows Server 2008 R2', useLatest: false, recommended: ['0.1.190', '0.1.172'] },
	{ osName: 'Windows Server 2008', useLatest: false, recommended: ['0.1.190'] },
	{ osName: 'Windows XP', useLatest: false, recommended: ['0.1.190'] }
];

export type { VirtioOsRecommendation };
