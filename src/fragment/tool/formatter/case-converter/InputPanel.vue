<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
		clear: [];
		example: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">变量名输入</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<n-input
			:autosize="{ minRows: 3, maxRows: 8 }"
			:input-props="{ class: 'font-mono' }"
			:value="props.modelValue"
			placeholder="输入任意格式的变量名，如 userProfileName / user_profile_id / parse-json-data ..."
			type="textarea"
			@update:value="(v: string) => emit('update:modelValue', v)"
		/>
		<div class="mt-2 flex items-center gap-2">
			<!-- 示例：循环切换一组内置示例输入 -->
			<n-button secondary size="tiny" @click="emit('example')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.textFormat" :size="14" />
					<span>示例</span>
				</span>
			</n-button>
			<!-- 清空：清空输入内容 -->
			<n-button :disabled="!props.modelValue" secondary size="tiny" @click="emit('clear')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.close" :size="14" />
					<span>清空</span>
				</span>
			</n-button>
		</div>
	</div>
</template>
