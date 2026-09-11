<script lang="ts" setup>
	import { NAlert } from 'naive-ui';
	import InfoRow from '@/fragment/tool/network/common/InfoRow.vue';
	import type { SubnetCalcResult } from '@/types/ip';

	defineProps<{
		result: SubnetCalcResult | null;
		error: string;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();

	/** 子网数量格式化（IPv4 为 number，IPv6 可能超出安全整数范围而为 string） */
	function formatCount(count: number | string): string {
		const num = Number(count);
		if (Number.isFinite(num) && num <= Number.MAX_SAFE_INTEGER) {
			return num.toLocaleString('zh-CN');
		}
		return count.toString();
	}
</script>

<template>
	<div>
		<n-alert v-if="error" class="text-sm" type="error">
			{{ error }}
		</n-alert>

		<!-- 有结果时的完整展示 -->
		<div v-if="result" class="space-y-6">
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.network" label="网络地址" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="`/${result.prefix}`" label="前缀长度" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="`/${result.targetPrefix}`" label="划分目标前缀" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="formatCount(result.subnetCount)" label="子网数量" @copy="(v: string) => emit('copy', v)" />
				<template v-if="result.version === 4">
					<InfoRow :value="result.mask" label="子网掩码" mono @copy="(v: string) => emit('copy', v)" />
					<InfoRow :value="result.wildcard" label="通配符掩码" mono @copy="(v: string) => emit('copy', v)" />
					<InfoRow :value="result.broadcast" label="广播地址" mono @copy="(v: string) => emit('copy', v)" />
					<InfoRow :value="result.usableHosts" label="可用主机数" @copy="(v: string) => emit('copy', v)" />
				</template>
				<template v-else>
					<InfoRow :value="result.mask" label="前缀掩码" mono @copy="(v: string) => emit('copy', v)" />
					<InfoRow :value="result.totalHosts" label="总地址数" @copy="(v: string) => emit('copy', v)" />
					<InfoRow :value="result.interfaceId" label="接口标识符" mono @copy="(v: string) => emit('copy', v)" />
				</template>
			</div>
		</div>

		<!-- 无结果占位 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入 IPv4 / IPv6 CIDR 网络地址后，子网计算结果将显示在这里</p>
		</div>
	</div>
</template>
