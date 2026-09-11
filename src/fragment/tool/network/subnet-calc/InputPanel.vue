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
			<label class="text-xs font-semibold text-slate-500">网络地址（CIDR）</label>
			<span class="text-[10px] text-slate-400">{{ modelValue.length }} 字符</span>
		</div>
		<div class="relative">
			<n-input
				:autosize="{ minRows: 2, maxRows: 4 }"
				:value="modelValue"
				placeholder="例如 192.168.1.0/24 或 2001:db8::/48"
				type="textarea"
				@update:value="(v: string) => emit('update:modelValue', v)"
			/>
			<!-- 空态覆盖层：输入为空时叠加在输入框上，点击穿透聚焦输入框 -->
			<div
				v-if="!modelValue"
				class="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
			>
				<div class="mb-2 text-slate-300">
					<TkuIcon :name="icons.subnet" :size="28" />
				</div>
				<p class="text-slate-400 text-xs">输入 IPv4 / IPv6 CIDR 网络地址，结果将自动更新</p>
			</div>
		</div>
	</div>
</template>
