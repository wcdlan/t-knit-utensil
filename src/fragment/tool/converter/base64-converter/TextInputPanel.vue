<script lang="ts" setup>
	import { NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { B64TextOp } from '@/types/base64';

	const props = defineProps<{
		modelValue: string;
		op: B64TextOp;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">
				{{ props.op === 'encode' ? '原始文本' : 'Base64 文本' }}
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
			<!-- 空态覆盖层：输入为空时提示 -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.textFormat" :size="28" />
				</div>
				<p class="text-xs text-slate-400">
					{{ props.op === 'encode' ? '输入文本，结果自动更新' : '粘贴 Base64，结果自动更新' }}
				</p>
			</div>
		</div>
	</div>
</template>
