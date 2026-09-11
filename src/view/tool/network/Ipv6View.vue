<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { copyToClipboard } from '@/utils/clipboard';
	import { analyzeIpv6 } from '@/utils/ip';
	import CidrInputPanel from '@/fragment/tool/network/CidrInputPanel.vue';
	import ResultPanel from '@/fragment/tool/network/ipv6/ResultPanel.vue';
	import AboutPanel from '@/fragment/tool/network/ipv6/AboutPanel.vue';
	import type { Ipv6ParseResult } from '@/types/ip';

	const input = ref('');

	const result = computed<Ipv6ParseResult | null>(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return null;
		return analyzeIpv6(trimmed);
	});

	const error = computed(() => {
		const trimmed = input.value.trim();
		if (!trimmed) return '';
		if (result.value) return '';
		return '无法解析该地址，请输入合法的 IPv6 地址，可选携带 CIDR 前缀（如 2001:db8::1/64）';
	});

	// 输入即出结果：result 为 computed，随 input 自动重新计算
	function copy(value: string) {
		copyToClipboard(value);
	}
</script>

<template>
	<div class="space-y-6">
		<!-- AboutPanel：工具简介与使用说明 -->
		<AboutPanel />
		<!-- CidrInputPanel：IPv6 地址 / CIDR 单行输入框（通用组件，传 label / placeholder / icon） -->
		<CidrInputPanel
			v-model:model-value="input"
			icon="mdi:ip-outline"
			label="IPv6 地址 / CIDR"
			placeholder="例如 2001:db8::1 或 2001:db8::1/64"
		/>
		<!-- ResultPanel：解析结果展示（地址形式 / 子网信息 / 规模映射 / 地址特性） -->
		<ResultPanel :error="error" :result="result" @copy="copy" />
	</div>
</template>
