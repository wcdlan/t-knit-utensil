<script lang="ts" setup>
	import { computed } from 'vue';
	import { NAlert, NButton, NInput } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { CronParseResult, CronPlaceholder } from '@/types/cron';

	const props = defineProps<{
		/** 表达式文本 */
		expression: string;
		/** 解析结果 */
		parsed: CronParseResult;
		/** 书写风格说明 */
		syntaxText: string;
		/** 别名占位提示（别名表达式无法展开为普通字段） */
		aliasHint: string;
		/** 示例模板 */
		templates: { label: string; expression: string }[];
		/** 可插入的特殊字符 */
		placeholders: CronPlaceholder[];
	}>();

	const emit = defineEmits<{
		'update:expression': [value: string];
		/** 插入模板（整条替换） */
		useTemplate: [expression: string];
		/** 追加片段到表达式末尾 */
		appendToken: [token: string];
		/** 回车或点击解析时触发 */
		parse: [];
		reset: [];
		clear: [];
	}>();

	/** 当前表达式的字段数量，用于展示 n/5、n/6 之类的进度提示 */
	const fieldCount = computed(() => props.expression.trim().split(/\s+/).filter(Boolean).length);
</script>

<template>
	<div class="space-y-4">
		<!-- 输入区 -->
		<div>
			<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
				<label class="text-xs font-semibold text-slate-500">Cron 表达式</label>
				<div class="flex items-center gap-3">
					<span v-if="props.parsed.ok" class="flex items-center gap-1 text-xs text-emerald-600">
						<TkuIcon :name="icons.check" :size="14" />
						<span>解析通过 · {{ props.syntaxText }} · {{ fieldCount }} 个字段</span>
					</span>
					<span v-else class="flex items-center gap-1 text-xs text-rose-500">
						<TkuIcon :name="icons.close" :size="14" />
						<span>解析失败</span>
					</span>
					<!-- 重置：恢复默认示例 -->
					<n-button quaternary size="tiny" @click="emit('reset')">重置示例</n-button>
					<!-- 清空：清空输入 -->
					<n-button quaternary size="tiny" @click="emit('clear')">清空</n-button>
				</div>
			</div>

			<!-- NInput：cron 表达式输入框，支持回车即时解析 -->
			<n-input
				:autosize="{ minRows: 1, maxRows: 3 }"
				:value="props.expression"
				class="!font-mono"
				placeholder="例如：*/5 * * * * 或 0 30 2 * * ?"
				size="large"
				type="textarea"
				@update:value="(value: string) => emit('update:expression', value)"
				@keydown.enter.prevent="emit('parse')"
			/>

			<p class="mt-2 text-xs text-slate-400">
				{{ props.aliasHint }}
			</p>
		</div>

		<!-- 错误提示 -->
		<n-alert v-if="!props.parsed.ok && props.parsed.errors.length" :show-icon="true" size="small" type="error">
			<div class="space-y-1">
				<div v-for="(error, index) in props.parsed.errors" :key="index">{{ error }}</div>
			</div>
		</n-alert>

		<!-- 示例模板：一键填入完整表达式 -->
		<div>
			<div class="mb-2 text-xs font-semibold text-slate-500">示例模板</div>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="template in props.templates"
					:key="template.expression"
					class="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
					type="button"
					@click="emit('useTemplate', template.expression)"
				>
					<span class="font-medium">{{ template.label }}</span>
					<span class="ml-1.5 font-mono text-[10px] text-slate-400">{{ template.expression }}</span>
				</button>
			</div>
		</div>

		<!-- 特殊字符：点击追加到表达式末尾 -->
		<div>
			<div class="mb-2 text-xs font-semibold text-slate-500">特殊字符（点击追加到表达式末尾）</div>
			<div class="flex flex-wrap gap-2">
				<button
					v-for="item in props.placeholders"
					:key="item.text"
					:title="item.hint"
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white font-mono text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700"
					type="button"
					@click="emit('appendToken', item.text)"
				>
					{{ item.label }}
				</button>
			</div>
			<p class="mt-2 text-xs text-slate-400">
				* 任意值 · ? 日/周占位 · , 列表 · - 范围 · / 步长 · L 最后一天 · W 最近工作日 · # 第 n 个星期几
			</p>
		</div>
	</div>
</template>
