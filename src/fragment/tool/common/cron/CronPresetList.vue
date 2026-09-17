<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NButton, NInput } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CronPreset } from '@/types/cron';

	const props = defineProps<{
		/** 常用表达式库 */
		presets: CronPreset[];
		/** 分组列表 */
		categories: string[];
		/** 当前表达式（与列表项一致时标记为已载入） */
		expression: string;
		/** 常用表达式的分类说明 */
		categoryHints: { category: string; hint: string }[];
	}>();

	const emit = defineEmits<{
		/** 载入某条表达式 */
		load: [expression: string];
		copy: [value: string];
	}>();

	/** 当前选中的分组，'全部' 表示不筛选 */
	const activeCategory = ref('全部');
	/** 关键字搜索 */
	const keyword = ref('');

	/** 分组选项（全部置顶） */
	const categoryOptions = computed(() => ['全部', ...props.categories]);

	/** 过滤后的表达式列表 */
	const filtered = computed(() => {
		const key = keyword.value.trim().toLowerCase();
		return props.presets.filter((preset) => {
			const categoryMatched = activeCategory.value === '全部' || preset.category === activeCategory.value;
			if (!categoryMatched) return false;
			if (!key) return true;
			return (
				preset.name.toLowerCase().includes(key) ||
				preset.expression.toLowerCase().includes(key) ||
				preset.description.toLowerCase().includes(key)
			);
		});
	});

	/** 当前分组的说明文案 */
	const activeHint = computed(() => {
		const matched = props.categoryHints.find((item) => item.category === activeCategory.value);
		return matched ? matched.hint : '覆盖从每秒到每年的常见调度场景，点击「载入」即可在解析页签查看语义与执行时间。';
	});
</script>

<template>
	<div class="space-y-4">
		<!-- 搜索与分组筛选 -->
		<div class="space-y-3">
			<n-input
				v-model:value="keyword"
				clearable
				placeholder="搜索名称、表达式或用途，如 备份 / 1-5 / 每月"
				size="small"
			/>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="category in categoryOptions"
					:key="category"
					:class="
						category === activeCategory
							? 'bg-blue-600 text-white shadow-sm'
							: 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
					"
					class="rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
					type="button"
					@click="activeCategory = category"
				>
					{{ category }}
				</button>
			</div>
			<p class="text-xs text-slate-400">{{ activeHint }}</p>
		</div>

		<!-- 表达式卡片列表 -->
		<div v-if="filtered.length" class="grid gap-2">
			<div
				v-for="preset in filtered"
				:key="preset.expression + preset.name"
				class="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:gap-4"
			>
				<!-- 名称与用途 -->
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium text-slate-700">{{ preset.name }}</span>
						<span
							v-if="preset.expression === props.expression"
							class="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600"
						>
							当前
						</span>
					</div>
					<div class="mt-0.5 text-xs text-slate-500">{{ preset.description }}</div>
				</div>

				<!-- 表达式文本（点击复制） -->
				<button
					:title="'点击复制 ' + preset.expression"
					class="shrink-0 cursor-pointer rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 transition hover:bg-slate-200"
					type="button"
					@click="emit('copy', preset.expression)"
				>
					{{ preset.expression }}
				</button>

				<!-- 载入到表达式输入框 -->
				<n-button class="shrink-0" secondary size="small" type="primary" @click="emit('load', preset.expression)">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.download" :size="14" />
						<span>载入</span>
					</span>
				</n-button>
			</div>
		</div>

		<!-- 空态 -->
		<div
			v-else
			class="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<span class="text-xs text-slate-400">没有匹配的表达式，换个关键字试试</span>
		</div>
	</div>
</template>
