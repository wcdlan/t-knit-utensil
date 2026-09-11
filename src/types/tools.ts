export interface Tool {
	id: string;
	name: string;
	description: string;
	icon: string;
	/** 推荐标记：功能最完整/最全的工具，搜索与卡片中展示醒目徽标 */
	featured?: boolean;
}

export interface ToolGroup {
	id: string;
	name: string;
	icon: string;
	tools: Tool[];
}
