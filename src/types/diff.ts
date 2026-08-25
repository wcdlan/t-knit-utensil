// 文本对比（Diff）工具相关类型

/** 差异行的类型：未变 / 新增 / 删除 */
export type DiffLineType = 'same' | 'added' | 'removed';

/** 单行对比结果 */
export interface DiffLine {
	type: DiffLineType;
	text: string;
}

/** 对比统计摘要 */
export interface DiffStats {
	added: number;
	removed: number;
	same: number;
}
