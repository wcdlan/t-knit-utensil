<script lang="ts" setup>
	import { NButton, NButtonGroup, NInputNumber, NTag } from 'naive-ui';

	const props = defineProps<{
		/** 输入网络的前缀长度 */
		sourcePrefix: number;
		/** 协议版本（决定前缀上限 32 / 128） */
		version: 4 | 6;
		targetPrefix: number;
	}>();

	const emit = defineEmits<{
		'update:target-prefix': [value: number];
	}>();

	/** 目标前缀上限 */
	const maxPrefix = props.version === 4 ? 32 : 128;

	/** 常用快捷前缀按钮（IPv4 与 IPv6 各有侧重） */
	const quickPrefixes = props.version === 4 ? [24, 25, 26, 27, 28, 29, 30, 31, 32] : [48, 56, 60, 64, 80, 96, 112, 128];

	/** 是否超出源前缀（非法值提示用） */
	function valid(p: number): boolean {
		return p >= props.sourcePrefix && p <= maxPrefix;
	}
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">划分子网</span>
				<n-tag round size="small" type="info"> 原前缀 /{{ sourcePrefix }} </n-tag>
				<n-tag v-if="!valid(targetPrefix)" round size="small" type="error"> 目标前缀需 ≥ /{{ sourcePrefix }} </n-tag>
			</div>
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex items-center gap-2">
					<span class="text-xs text-slate-400">目标前缀</span>
					<n-input-number
						:max="maxPrefix"
						:min="sourcePrefix"
						:precision="0"
						:step="1"
						:value="targetPrefix"
						class="!w-[110px]"
						size="small"
						@update:value="(v: number | null) => emit('update:target-prefix', v ?? sourcePrefix)"
					/>
				</div>
				<!-- 快捷前缀按钮 -->
				<n-button-group size="small">
					<n-button
						v-for="p in quickPrefixes"
						:key="p"
						:disabled="p < sourcePrefix"
						:type="targetPrefix === p ? 'primary' : 'default'"
						@click="emit('update:target-prefix', p)"
					>
						/{{ p }}
					</n-button>
				</n-button-group>
			</div>
		</div>
	</div>
</template>
