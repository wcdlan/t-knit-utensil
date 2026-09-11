<script lang="ts" setup>
	import { NTag } from 'naive-ui';
	import type { JwtClaimInfo, JwtTimeStatus } from '@/types/jwt';

	const props = defineProps<{
		claims: JwtClaimInfo[];
		timeStatus: JwtTimeStatus;
	}>();

	const emit = defineEmits<{
		copy: [text: string];
	}>();
</script>

<template>
	<div>
		<div class="mb-3 flex flex-wrap items-center gap-2">
			<label class="text-xs font-semibold text-slate-500">声明解读</label>
			<span class="text-[10px] text-slate-400">共 {{ props.claims.length }} 条</span>
			<!-- 整体时间状态标签：过期 / 尚未生效 / 有效期内 -->
			<n-tag v-if="props.timeStatus.expired" :bordered="false" size="small" type="error">已过期</n-tag>
			<n-tag v-else-if="props.timeStatus.notYetValid" :bordered="false" size="small" type="warning">尚未生效</n-tag>
			<n-tag v-else :bordered="false" size="small" type="success">有效期内</n-tag>
		</div>

		<!-- 空态占位：无声明时仍保留结构 -->
		<div
			v-if="!props.claims.length"
			class="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400"
		>
			Payload 中暂无声明字段
		</div>

		<div v-else class="overflow-hidden rounded-lg border border-slate-200">
			<div
				v-for="claim in props.claims"
				:key="claim.key"
				class="group flex cursor-pointer flex-col gap-2 border-b border-slate-100 bg-white px-3 py-2.5 transition last:border-b-0 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:gap-4"
				@click="emit('copy', claim.value)"
			>
				<!-- 键名与含义 -->
				<div class="shrink-0 sm:w-52">
					<div class="flex flex-wrap items-center gap-1.5">
						<span class="font-mono text-xs font-semibold text-slate-700">{{ claim.key }}</span>
						<n-tag v-if="claim.status" :bordered="false" :type="claim.statusType" size="tiny">
							{{ claim.status }}
						</n-tag>
					</div>
					<div class="mt-0.5 text-[11px] leading-snug text-slate-400">{{ claim.label }}</div>
				</div>
				<!-- 声明值：时间类声明额外显示可读时间 -->
				<div class="min-w-0 flex-1">
					<div class="break-all font-mono text-sm text-slate-700">{{ claim.value }}</div>
					<div v-if="claim.time" class="mt-0.5 text-[11px] text-blue-600">{{ claim.time }}</div>
				</div>
				<span class="shrink-0 text-[10px] text-slate-400">{{ claim.description }}</span>
			</div>
		</div>
	</div>
</template>
