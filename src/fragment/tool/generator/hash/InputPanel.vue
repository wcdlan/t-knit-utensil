<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		modelValue: string;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<div class="flex items-center justify-between mb-2">
			<label class="text-xs font-semibold text-slate-500">输入文本</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 5, maxRows: 12 }"
				:value="props.modelValue"
				placeholder="输入要计算哈希的文本..."
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.shieldLock" :size="28" />
				</div>
				<p class="text-slate-400 text-xs">输入文本后点击「计算哈希」生成结果</p>
			</div>
		</div>
	</div>
</template>
