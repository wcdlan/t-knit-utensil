<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		modelValue: string;
		mode: 'encode' | 'decode';
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">
				{{ props.mode === 'encode' ? '原始 URL 或文本' : '已编码字符串' }}
			</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 6, maxRows: 16 }"
				:value="props.modelValue"
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.link" :size="28" />
				</div>
				<p class="text-slate-400 text-xs">输入文本，结果将自动更新</p>
			</div>
		</div>
	</div>
</template>
