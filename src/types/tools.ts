export interface Tool {
	id: string;
	name: string;
	description: string;
	icon: string;
}

export interface ToolGroup {
	id: string;
	name: string;
	icon: string;
	tools: Tool[];
}
