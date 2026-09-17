<script lang="ts" setup>
	import { computed } from 'vue';
	import { type DataTableColumns, NAlert, NButton, NButtonGroup, NDataTable } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CronRunItem } from '@/types/cron';

	const props = defineProps<{
		/** 下一次执行时间列表 */
		items: CronRunItem[];
		/** 未能生成的剩余条数（扫描达到上限时大于 0） */
		remaining: number;
		/** 预览条数 */
		count: number;
		/** 可选的预览条数档位 */
		countOptions: number[];
		/** 表达式是否可解析 */
		ok: boolean;
	}>();

	const emit = defineEmits<{
		'update:count': [value: number];
		copy: [value: string];
		copyAll: [];
	}>();

	/** 表格列定义 */
	const columns = computed<DataTableColumns<CronRunItem>>(() => [
		{ title: '#', key: 'index', width: 56, align: 'center' },
		{ title: '本地时间', key: 'localText', minWidth: 190, className: 'font-mono' },
		{ title: 'UTC 时间', key: 'utcText', minWidth: 190, className: 'font-mono' },
		{ title: '距今', key: 'relative', width: 110, className: 'text-slate-500' }
	]);

	/** 行点击复制该次执行时间（本地时间文本） */
	function handleRowClick(row: CronRunItem) {
		emit('copy', row.localText);
	}
</script>

<template>
	<div class="space-y-3">
		<!-- 预览控制条：条数档位 + 复制全部 -->
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">预览条数</span>
				<!-- NButtonGroup：逐条切换预览数量 -->
				<n-button-group size="small">
					<n-button
						v-for="option in props.countOptions"
						:key="option"
						:quaternary="option !== props.count"
						:secondary="option === props.count"
						:type="option === props.count ? 'primary' : 'default'"
						@click="emit('update:count', option)"
					>
						{{ option }}
					</n-button>
				</n-button-group>
			</div>
			<!-- 复制全部：逐行拼接「本地时间」 -->
			<n-button :disabled="!props.items.length" secondary size="small" @click="emit('copyAll')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.clipboard" :size="15" />
					<span>复制全部</span>
				</span>
			</n-button>
		</div>

		<!-- 扫描上限提示 -->
		<n-alert v-if="props.remaining > 0" :show-icon="true" size="small" type="warning">
			未来可预见范围内仅匹配到 {{ props.items.length }} 次，还有
			{{ props.remaining }} 次未生成（该表达式触发间隔过长）。
		</n-alert>

		<!-- 结果为空：表达式异常或长期不触发 -->
		<div
			v-if="!props.ok"
			class="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50"
		>
			<span class="text-xs text-slate-400">表达式解析通过后，将展示接下来的执行时间</span>
		</div>
		<div
			v-else-if="!props.items.length"
			class="flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-amber-200 bg-amber-50/40"
		>
			<span class="text-xs text-amber-600">该表达式在可预见范围内不会触发（如「2 月 31 日」这类不存在的日期）</span>
		</div>

		<!-- NDataTable：执行时间表格，点击行复制时间文本 -->
		<n-data-table
			v-else
			:bordered="false"
			:columns="columns"
			:data="props.items"
			:row-key="(row: CronRunItem) => String(row.timestampMs)"
			:single-line="false"
			size="small"
			@row-click="handleRowClick"
		/>
	</div>
</template>
