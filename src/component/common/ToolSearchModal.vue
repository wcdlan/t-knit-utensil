<script lang="ts" setup>
	import { computed, h, nextTick, ref, watch } from 'vue';
	import { NEmpty, NInput, NModal } from 'naive-ui';
	import { icons } from '@/data/icons';
	import { toolGroups } from '@/data/tools';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		show: boolean;
		/** 当前快捷键展示文本（如 Ctrl + /），显示在弹窗底部提示 */
		shortcutText: string;
	}>();

	const emit = defineEmits<{
		'update:show': [value: boolean];
		navigate: [toolId: string];
	}>();

	/** 全部工具扁平化列表（含所属分组名，用于搜索与展示） */
	const allTools = computed(() =>
		toolGroups.flatMap((group) =>
			group.tools.map((tool) => ({
				id: tool.id,
				name: tool.name,
				description: tool.description,
				icon: tool.icon,
				groupName: group.name
			}))
		)
	);

	const query = ref('');
	const activeIndex = ref(0);
	const inputRef = ref<InstanceType<typeof NInput> | null>(null);

	/** 过滤后的工具列表 */
	const filteredTools = computed(() => {
		const q = query.value.trim().toLowerCase();
		if (!q) return allTools.value;
		return allTools.value.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.description.toLowerCase().includes(q) ||
				t.groupName.toLowerCase().includes(q)
		);
	});

	// 打开弹窗时重置搜索并聚焦输入框；关闭时清空搜索词
	watch(
		() => props.show,
		async (visible) => {
			if (visible) {
				query.value = '';
				activeIndex.value = 0;
				await nextTick();
				inputRef.value?.focus();
			}
		}
	);

	/** 选中项下标始终落在有效范围内 */
	function clampIndex(index: number): number {
		const max = filteredTools.value.length - 1;
		if (max < 0) return 0;
		return Math.min(Math.max(index, 0), max);
	}

	function moveSelection(delta: number) {
		activeIndex.value = clampIndex(activeIndex.value + delta);
	}

	/** 回车选中当前项并跳转 */
	function selectActive() {
		const tool = filteredTools.value[activeIndex.value];
		if (!tool) return;
		emit('navigate', tool.id);
		emit('update:show', false);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			moveSelection(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			moveSelection(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			selectActive();
		}
	}

	function handleSelect(index: number) {
		activeIndex.value = index;
		selectActive();
	}
</script>

<template>
	<!-- 工具搜索弹窗：全局快捷键呼出，输入即过滤，上下键选择、回车跳转 -->
	<n-modal
		:close-on-esc="true"
		:content-style="{ padding: '0' }"
		:header-style="{ padding: '14px 16px', borderBottom: '1px solid #eef2f7' }"
		:mask-closable="true"
		:show="props.show"
		:style="{ width: '640px', maxWidth: 'calc(100vw - 32px)', borderRadius: '12px' }"
		:title="'搜索工具'"
		preset="card"
		@update:show="(v: boolean) => emit('update:show', v)"
	>
		<div class="flex flex-col">
			<!-- 搜索输入框：输入即过滤全部工具 -->
			<div class="p-3">
				<n-input
					ref="inputRef"
					:input-props="{ class: 'text-sm' }"
					:prefix="
						() =>
							h('div', { class: 'flex items-center text-slate-400' }, [h(TkuIcon, { name: icons.magnify, size: 18 })])
					"
					:value="query"
					placeholder="输入工具名称、描述或分组..."
					size="large"
					@keydown="handleKeydown"
					@update:value="
						(v: string) => {
							query = v;
							activeIndex = 0;
						}
					"
				/>
			</div>

			<!-- 结果列表：最多展示 8 条，支持点击与键盘选中 -->
			<div class="max-h-80 min-h-24 overflow-y-auto border-t border-slate-100 p-2">
				<n-empty v-if="!filteredTools.length" class="py-10" description="没有匹配的工具" />
				<div
					v-for="(tool, index) in filteredTools.slice(0, 8)"
					:key="tool.id"
					:class="index === activeIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-transparent'"
					class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition"
					@click="handleSelect(index)"
					@mouseenter="activeIndex = index"
				>
					<!-- 工具图标 -->
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-100"
					>
						<TkuIcon :name="tool.icon" :size="18" />
					</div>
					<!-- 名称与描述 -->
					<div class="min-w-0 flex-1">
						<div class="truncate text-sm font-medium text-slate-700">{{ tool.name }}</div>
						<div class="truncate text-xs text-slate-400">{{ tool.description }}</div>
					</div>
					<!-- 所属分组 -->
					<span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
						{{ tool.groupName }}
					</span>
				</div>
			</div>

			<!-- 底部操作提示 -->
			<div class="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
				<span class="flex items-center gap-3">
					<span
						><kbd class="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono">↑</kbd>
						<kbd class="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono">↓</kbd> 选择</span
					>
					<span><kbd class="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono">Enter</kbd> 打开</span>
					<span><kbd class="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono">Esc</kbd> 关闭</span>
				</span>
				<span>{{ props.shortcutText }} 呼出</span>
			</div>
		</div>
	</n-modal>
</template>
