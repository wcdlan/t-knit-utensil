<script lang="ts" setup>
	import { NAlert } from 'naive-ui';
	import InfoRow from '@/fragment/tool/network/common/InfoRow.vue';
	import TagRow from '@/fragment/tool/network/common/TagRow.vue';
	import type { Ipv4ParseResult } from '@/types/ip';

	defineProps<{
		result: Ipv4ParseResult | null;
		error: string;
	}>();

	const emit = defineEmits<{
		copy: [value: string];
	}>();
</script>

<template>
	<div>
		<n-alert v-if="error" class="text-sm" type="error">
			{{ error }}
		</n-alert>

		<!-- 有结果时的完整展示 -->
		<div v-if="result" class="space-y-6">
			<!-- 地址基本属性 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.ip" label="地址（去掉前缀）" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="`/${result.prefix}`" label="前缀长度" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.mask" label="子网掩码" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.maskBinary" label="掩码（二进制）" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.wildcard" label="通配符掩码" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="`Class ${result.ipClass}`" label="地址类别" @copy="(v: string) => emit('copy', v)" />
			</div>

			<!-- 子网边界 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.network" label="网络地址" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.broadcast" label="广播地址" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.firstHost" label="首可用主机" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.lastHost" label="末可用主机" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.totalHosts" label="总地址数" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.usableHosts" label="可用主机数" @copy="(v: string) => emit('copy', v)" />
			</div>

			<!-- 其他表示形式 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.binary" label="二进制" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.hex" label="十六进制" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.int" label="十进制整数" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.reverse" label="反向 DNS" mono @copy="(v: string) => emit('copy', v)" />
			</div>

			<!-- 地址特性 -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<TagRow :value="result.isPrivate ? '是' : '否'" accent="emerald" label="私有地址" />
				<TagRow :value="result.isLoopback ? '是' : '否'" accent="blue" label="环回地址" />
				<TagRow :value="result.isMulticast ? '是' : '否'" accent="orange" label="组播地址" />
				<TagRow :value="result.isLinkLocal ? '是' : '否'" accent="orange" label="链路本地" />
				<TagRow :value="result.isReserved ? '是' : '否'" accent="gray" label="保留地址" />
			</div>
		</div>

		<!-- 无结果占位 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入 IPv4 地址后，解析结果将显示在这里</p>
		</div>
	</div>
</template>
