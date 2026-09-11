<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		output: string;
		error: string;
		generating: boolean;
	}>();

	const emit = defineEmits<{
		copy: [];
		clear: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">生成的 Token</label>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-[10px] text-slate-400">{{ props.output.length }} 字符</span>
				<n-button :disabled="!props.output" secondary size="tiny" @click="emit('copy')">复制</n-button>
				<n-button :disabled="!props.output" secondary size="tiny" @click="emit('clear')">清空</n-button>
			</div>
		</div>

		<!-- 生成失败提示（Header / Payload JSON 非法或密钥缺失） -->
		<div v-if="props.error" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
			{{ props.error }}
		</div>

		<div class="relative">
			<n-input
				:autosize="{ minRows: 5, maxRows: 12 }"
				:input-props="{ class: 'font-mono text-xs' }"
				:loading="props.generating"
				:value="props.output"
				class="cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<!-- 结果区占位：未生成时保持结构不跳变 -->
			<div
				v-if="!props.output"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.lock" :size="24" />
				</div>
				<span class="text-xs text-slate-400">填写 Header / Payload 与密钥后点击「生成 Token」</span>
			</div>
		</div>
	</div>
</template>
