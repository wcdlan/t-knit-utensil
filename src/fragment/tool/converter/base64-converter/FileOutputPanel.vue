<script lang="ts" setup>
	import { NButton, NInput, NSwitch } from 'naive-ui';
	import type { B64FileResult } from '@/types/base64';

	const props = defineProps<{
		result: B64FileResult | null;
		loading: boolean;
		includeHeader: boolean;
	}>();

	const emit = defineEmits<{
		'update:includeHeader': [value: boolean];
		copy: [];
		download: [];
		reset: [];
	}>();

	/** 按开关决定展示内容：完整 Data URI 或纯 Base64 */
	function displayValue(): string {
		if (!props.result) return '';
		return props.includeHeader ? props.result.dataUri : props.result.raw;
	}
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">Base64 结果</label>
			<div class="flex flex-wrap items-center gap-3">
				<!-- 携带 Data URI 头开关 -->
				<label class="flex cursor-pointer items-center gap-1.5">
					<span class="text-[11px] text-slate-400">携带 Data URI 头</span>
					<n-switch
						:value="props.includeHeader"
						size="small"
						@update:value="(v: boolean) => emit('update:includeHeader', v)"
					/>
				</label>
				<span class="text-[10px] text-slate-400">{{ displayValue().length }} 字符</span>
			</div>
		</div>

		<div class="relative">
			<n-input
				:autosize="{ minRows: 6, maxRows: 16 }"
				:input-props="{ class: 'font-mono text-xs' }"
				:loading="props.loading"
				:value="displayValue()"
				class="cursor-pointer"
				readonly
				type="textarea"
				@click="emit('copy')"
			/>
			<!-- 空态占位：未选择文件时保持结构 -->
			<div v-if="!props.result" class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<span class="text-xs text-slate-300">选择文件后自动生成 Base64</span>
			</div>
		</div>

		<!-- 操作按钮：复制 / 下载为文本文件 -->
		<div class="mt-3 flex flex-wrap items-center gap-2">
			<n-button :disabled="!props.result" secondary size="small" @click="emit('copy')">复制</n-button>
			<n-button :disabled="!props.result" secondary size="small" @click="emit('download')">下载为 .txt</n-button>
		</div>
	</div>
</template>
