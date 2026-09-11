<script lang="ts" setup>
	import { computed, ref, watch } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { calcSubnets } from '@/utils/ip';
	import InputPanel from '@/fragment/tool/network/subnet-calc/InputPanel.vue';
	import PrefixConfigPanel from '@/fragment/tool/network/subnet-calc/PrefixConfigPanel.vue';
	import ResultPanel from '@/fragment/tool/network/subnet-calc/ResultPanel.vue';
	import SubnetListPanel from '@/fragment/tool/network/subnet-calc/SubnetListPanel.vue';
	import AboutPanel from '@/fragment/tool/network/subnet-calc/AboutPanel.vue';
	import type { SubnetCalcResult } from '@/types/ip';

	const input = ref('192.168.1.0/24');
	const targetPrefix = ref(26);

	/** 识别输入协议版本（4 / 6 / null） */
	const version = computed<4 | 6 | null>(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return null;
		if (trimmed.includes('.')) return 4;
		if (trimmed.includes(':')) return 6;
		return null;
	});

	/** 当前输入网络的前缀长度 */
	const sourcePrefix = computed<number | null>(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return null;
		const parts = trimmed.split('/');
		const p = parseInt(parts[1] ?? '', 10);
		return Number.isNaN(p) ? (version.value === 4 ? 32 : 128) : p;
	});

	const result = computed<SubnetCalcResult | null>(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return null;
		return calcSubnets(trimmed, targetPrefix.value);
	});

	const error = computed(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return '';
		if (result.value) return '';
		return '无法解析该网络地址，请输入合法的 IPv4 / IPv6 CIDR 网络（如 192.168.1.0/24 或 2001:db8::/48）';
	});

	// 源前缀 / 协议版本变化时自动校准目标前缀（不低于源前缀、不超协议上限）
	watch([sourcePrefix, version], () => {
		const max = version.value === 4 ? 32 : 128;
		const min = sourcePrefix.value ?? 0;
		if (targetPrefix.value < min || targetPrefix.value > max) {
			targetPrefix.value = Math.min(Math.max(targetPrefix.value, min), max);
		}
	});

	function copy(value: string) {
		copyToClipboard(value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- InputPanel：IPv4 / IPv6 CIDR 网络地址输入框 -->
		<InputPanel v-model:model-value="input" />
		<!-- PrefixConfigPanel：划分子网目标前缀配置（输入框 + 快捷按钮 + 合法性提示） -->
		<PrefixConfigPanel
			:source-prefix="sourcePrefix ?? 0"
			:target-prefix="targetPrefix"
			:version="version ?? 4"
			@update:target-prefix="(v: number) => (targetPrefix = v)"
		/>
		<!-- ResultPanel：子网计算结果概览（网络/前缀/掩码/子网数量等） -->
		<ResultPanel :error="error" :result="result" @copy="copy" />
		<!-- SubnetListPanel：划分出的子网清单（可滚动表格，行内复制） -->
		<SubnetListPanel
			v-if="result"
			:subnets="result.subnets"
			:total="result.subnetCount"
			:truncated="result.truncated"
			@copy="copy"
		/>
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
	</div>
</template>
