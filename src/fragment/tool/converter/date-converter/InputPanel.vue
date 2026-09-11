<script lang="ts" setup>
	import { NButton, NInput, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { DateTimeParseResult } from '@/types/datetime';

	const props = defineProps<{
		modelValue: string;
		parseResult: DateTimeParseResult;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
		useNow: [];
		clear: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
			<label class="text-xs font-semibold text-slate-500">日期时间输入</label>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
				<!-- 填入当前时间：按输入时区生成可直接解析的格式 -->
				<n-button secondary size="tiny" @click="emit('useNow')">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.clock" :size="14" />
						<span>填入当前时间</span>
					</span>
				</n-button>
				<!-- 清空输入 -->
				<n-button :disabled="!props.modelValue" secondary size="tiny" @click="emit('clear')">
					<span class="flex items-center gap-1">
						<TkuIcon :name="icons.close" :size="14" />
						<span>清空</span>
					</span>
				</n-button>
			</div>
		</div>

		<n-input
			:autosize="{ minRows: 2, maxRows: 6 }"
			:input-props="{ class: 'font-mono text-sm' }"
			:status="props.parseResult.ok || !props.modelValue ? undefined : 'error'"
			:value="props.modelValue"
			placeholder="粘贴任意日期格式，如 2024-01-15 10:30:00 / 2024/1/15 / Jan 15, 2024 / 1705314600 ..."
			type="textarea"
			@update:value="(v: string) => emit('update:modelValue', v)"
		/>

		<!-- 识别结果：成功显示命中的格式与说明，失败显示异常提示 -->
		<div class="mt-2">
			<div
				v-if="props.modelValue && props.parseResult.ok"
				class="flex flex-wrap items-center gap-2 rounded-lg border border-green-200 bg-green-50/70 px-3 py-2"
			>
				<TkuIcon :name="icons.check" :size="14" class="text-green-600" />
				<span class="text-xs font-medium text-green-700">已识别格式：{{ props.parseResult.value.formatName }}</span>
				<!-- 是否自带时区标记 -->
				<n-tag v-if="props.parseResult.value.explicitZone" :bordered="false" size="tiny" type="info">
					输入自带时区 {{ props.parseResult.value.zoneText }}
				</n-tag>
				<n-tag v-else :bordered="false" size="tiny" type="default">按输入时区解释</n-tag>
				<span v-if="props.parseResult.value.note" class="text-[11px] text-green-600">
					{{ props.parseResult.value.note }}
				</span>
			</div>

			<div
				v-else-if="props.modelValue && !props.parseResult.ok"
				class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
			>
				{{ props.parseResult.error }}
			</div>

			<div v-else class="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
				输入后自动识别格式并转换；无法识别时会在此提示异常
			</div>
		</div>
	</div>
</template>
