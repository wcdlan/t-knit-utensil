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
			<label class="text-xs font-semibold text-slate-500">JWT Token</label>
			<span class="text-[10px] text-slate-400">{{ props.modelValue.length }} 字符</span>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 4, maxRows: 10 }"
				:input-props="{ class: 'font-mono text-xs' }"
				:value="props.modelValue"
				placeholder="粘贴 JWT，形如 eyJhbGciOi...，支持带 Bearer 前缀"
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 空态覆盖层：输入为空时提示粘贴 token -->
			<div
				v-if="!props.modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.lock" :size="28" />
				</div>
				<p class="text-xs text-slate-400">粘贴 JWT 后自动解析</p>
			</div>
		</div>
		<div class="mt-2 flex items-center gap-2">
			<!-- 示例：载入 jwt.io 官方示例 token -->
			<n-button secondary size="tiny" @click="emit('example')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.lightbulb" :size="14" />
					<span>载入示例</span>
				</span>
			</n-button>
			<!-- 清空：清空 token 输入 -->
			<n-button :disabled="!props.modelValue" secondary size="tiny" @click="emit('clear')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.close" :size="14" />
					<span>清空</span>
				</span>
			</n-button>
		</div>
	</div>
</template>
