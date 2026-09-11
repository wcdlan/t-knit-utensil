<script lang="ts" setup>
	import { NAlert } from 'naive-ui';
	import InfoRow from '@/fragment/tool/network/common/InfoRow.vue';
	import TagRow from '@/fragment/tool/network/common/TagRow.vue';
	import type { Ipv6ParseResult } from '@/types/ip';

	defineProps<{
		result: Ipv6ParseResult | null;
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
			<!-- 地址形式 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.compressed" label="地址（去掉前缀）" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="`/${result.prefix}`" label="前缀长度" @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.expanded" label="完整展开形式" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.compressed" label="标准压缩形式" mono @copy="(v: string) => emit('copy', v)" />
			</div>

			<!-- 子网信息 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.network" label="网络地址" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow :value="result.maskCompressed" label="前缀掩码" mono @copy="(v: string) => emit('copy', v)" />
				<InfoRow
					:value="result.interfaceId"
					label="接口标识符（低 64 位）"
					mono
					@copy="(v: string) => emit('copy', v)"
				/>
				<InfoRow :value="result.reverse" label="反向 DNS" mono @copy="(v: string) => emit('copy', v)" />
			</div>

			<!-- 规模与映射 -->
			<div class="grid gap-3 sm:grid-cols-2">
				<InfoRow :value="result.totalHosts" label="总地址数" @copy="(v: string) => emit('copy', v)" />
				<InfoRow
					v-if="result.ipv4Mapped"
					:value="result.ipv4Mapped"
					label="IPv4 映射地址"
					mono
					@copy="(v: string) => emit('copy', v)"
				/>
			</div>

			<!-- 地址特性 -->
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<TagRow :value="result.isGlobalUnicast ? '是' : '否'" accent="blue" label="全局单播" />
				<TagRow :value="result.isUnspecified ? '是' : '否'" accent="gray" label="未指定地址" />
				<TagRow :value="result.isLoopback ? '是' : '否'" accent="blue" label="环回地址" />
				<TagRow :value="result.isLinkLocal ? '是' : '否'" accent="orange" label="链路本地" />
				<TagRow :value="result.isMulticast ? '是' : '否'" accent="orange" label="组播地址" />
				<TagRow :value="result.isUniqueLocal ? '是' : '否'" accent="emerald" label="唯一本地" />
				<TagRow :value="result.isIpv4Mapped ? '是' : '否'" accent="emerald" label="IPv4 映射" />
				<TagRow :value="result.isDocumentation ? '是' : '否'" accent="gray" label="文档示例" />
			</div>
		</div>

		<!-- 无结果占位 -->
		<div
			v-else
			class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center"
		>
			<p class="text-sm text-slate-400">输入 IPv6 地址后，解析结果将显示在这里</p>
		</div>
	</div>
</template>
