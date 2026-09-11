<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		/** 输入框标签文案（如「IPv4 地址 / CIDR」） */
		label: string;
		/** 输入框 placeholder 提示文案 */
		placeholder: string;
		/** 前缀图标名（icons 注册表，mdi: 前缀） */
		icon: string;
		/** 输入值（v-model） */
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">{{ label }}</label>
			<span class="text-[10px] tabular-nums text-slate-400">{{ modelValue.length }} 字符</span>
		</div>
		<!-- 单行输入框：等宽字体 + 前缀图标 + 可清空，placeholder 提示常见格式 -->
		<n-input
			:value="modelValue"
			class="!font-mono"
			clearable
			:placeholder="placeholder"
			@update:value="(v: string) => emit('update:modelValue', v)"
		>
			<template #prefix>
				<TkuIcon :name="icon" :size="16" class="text-slate-400" />
			</template>
		</n-input>
	</div>
</template>
