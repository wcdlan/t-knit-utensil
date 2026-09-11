<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">IPv6 地址 / CIDR</label>
			<span class="text-[10px] tabular-nums text-slate-400">{{ modelValue.length }} 字符</span>
		</div>
		<!-- 单行输入框：等宽字体 + 前缀图标 + 可清空，placeholder 提示常见格式 -->
		<n-input
			:value="modelValue"
			class="!font-mono"
			clearable
			placeholder="例如 2001:db8::1 或 2001:db8::1/64"
			@update:value="(v: string) => emit('update:modelValue', v)"
		>
			<template #prefix>
				<TkuIcon :name="icons.ipv6" :size="16" class="text-slate-400" />
			</template>
		</n-input>
	</div>
</template>
