<script lang="ts" setup>
	import { computed } from 'vue';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import { RAID_CATEGORY_LABELS, RAID_CATEGORY_ORDER } from '@/utils/raid';
	import type { RaidCalcResult, RaidCategory, RaidLevelId, RaidLevelMeta } from '@/types/raid';

	const props = defineProps<{
		/** 全部等级元信息 */
		levels: RaidLevelMeta[];
		/** 各等级在当前磁盘配置下的计算结果（用于展示可用状态） */
		results: RaidCalcResult[];
		/** 当前选中的等级 */
		selected: RaidLevelId;
	}>();

	const emit = defineEmits<{
		select: [value: RaidLevelId];
	}>();

	/** 按分类分组，便于对照选择（仅保留有等级的分类） */
	const grouped = computed(() =>
		RAID_CATEGORY_ORDER.map((category: RaidCategory) => ({
			category,
			label: RAID_CATEGORY_LABELS[category],
			levels: props.levels.filter((level) => level.category === category)
		})).filter((group) => group.levels.length > 0)
	);

	/** 取某等级在当前配置下是否可用 */
	function isValid(id: RaidLevelId): boolean {
		return props.results.find((item) => item.level === id)?.valid ?? false;
	}

	/** 等级提示：名称、别名、最少盘数与可用状态说明 */
	function levelTitle(level: RaidLevelMeta): string {
		const meta = `最少 ${level.minDisks} 盘${level.evenOnly ? '、需偶数' : ''}${level.needsSpan ? '、需配子组' : ''}`;
		const state = isValid(level.id)
			? level.summary
			: `不可用：${props.results.find((item) => item.level === level.id)?.reason ?? ''}`;
		return `${level.name} · ${level.alias}\n${meta}\n${state}`;
	}
</script>

<template>
	<!-- 等级选择面板：自然高度，不参与左栏拉伸（选中等级说明见下方独立的 SelectedLevelPanel） -->
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
		<div class="mb-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.raid" :size="15" class="text-blue-500" />
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">RAID 等级</span>
			</div>
			<span class="text-[10px] text-slate-400">共 {{ levels.length }} 个</span>
		</div>

		<!-- 等级选择：按分类分组的紧凑芯片，两/三列排布，悬停查看说明 -->
		<div class="space-y-1.5">
			<div v-for="group in grouped" :key="group.category">
				<div class="mb-0.5 flex items-center gap-2">
					<span class="shrink-0 text-[10px] text-slate-400">{{ group.label }}</span>
					<span class="h-px flex-1 bg-slate-200" />
				</div>
				<div class="grid grid-cols-2 gap-1 xl:grid-cols-3">
					<button
						v-for="level in group.levels"
						:key="level.id"
						:class="
							selected === level.id
								? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
								: 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
						"
						:title="levelTitle(level)"
						class="flex items-center justify-between gap-1 rounded-md border px-2 py-1 text-left transition"
						type="button"
						@click="emit('select', level.id)"
					>
						<span
							:class="selected === level.id ? 'text-blue-700' : 'text-slate-700'"
							class="truncate text-xs font-semibold"
						>
							{{ level.name }}
						</span>
						<span
							:class="isValid(level.id) ? 'text-emerald-600' : 'text-red-400'"
							class="shrink-0 text-[10px] font-medium"
						>
							{{ isValid(level.id) ? '可用' : '不足' }}
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
