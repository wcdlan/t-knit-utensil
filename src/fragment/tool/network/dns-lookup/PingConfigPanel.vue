<script lang="ts" setup>
	import { NAlert, NButton, NInput, NInputNumber, NRadioButton, NRadioGroup } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { DnsToolMeta, PingMode } from '@/types/dns';

	const props = defineProps<{
		/** PING 子工具元数据（提供标签、占位符、说明与示例） */
		meta: DnsToolMeta;
		/** 目标主机名或 IP */
		host: string;
		/** 探测方式 */
		mode: PingMode;
		/** TCP 探测端口 */
		port: number;
		/** 探测次数 */
		count: number;
		/** 服务端是否可用 ICMP ping 命令 */
		pingAvailable: boolean;
		/** 是否正在探测 */
		loading: boolean;
	}>();

	const emit = defineEmits<{
		'update:host': [value: string];
		'update:mode': [value: PingMode];
		'update:port': [value: number];
		'update:count': [value: number];
		start: [];
	}>();
</script>

<template>
	<div class="space-y-3">
		<div>
			<div class="mb-2 flex items-center justify-between">
				<label class="text-xs font-semibold text-slate-500">{{ props.meta.inputLabel }}</label>
				<span class="text-[10px] tabular-nums text-slate-400">{{ props.host.length }} 字符</span>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<n-input
					:placeholder="props.meta.placeholder"
					:value="props.host"
					class="!font-mono min-w-64 flex-1"
					clearable
					@keyup.enter="emit('start')"
					@update:value="(v: string) => emit('update:host', v)"
				>
					<template #prefix>
						<TkuIcon :name="icons.ping" :size="16" class="text-slate-400" />
					</template>
				</n-input>
				<n-button :loading="props.loading" type="primary" @click="emit('start')">
					<span class="flex items-center gap-1.5">
						<TkuIcon :name="icons.ping" :size="16" />
						<span>开始检测</span>
					</span>
				</n-button>
			</div>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<span class="text-xs text-slate-400">示例：</span>
				<n-button
					v-for="example in props.meta.examples"
					:key="example"
					:disabled="props.loading"
					secondary
					size="tiny"
					@click="emit('update:host', example)"
				>
					{{ example }}
				</n-button>
			</div>
		</div>

		<div class="flex flex-wrap items-end gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">探测方式</label>
				<n-radio-group :value="props.mode" @update:value="(v: PingMode) => emit('update:mode', v)">
					<n-radio-button value="icmp">ICMP ping</n-radio-button>
					<n-radio-button value="tcp">TCP 端口</n-radio-button>
				</n-radio-group>
			</div>
			<div v-if="props.mode === 'tcp'">
				<label class="mb-1 block text-xs font-semibold text-slate-500">探测端口</label>
				<n-input-number
					:max="65535"
					:min="1"
					:value="props.port"
					class="w-28"
					@update:value="(v: number | null) => emit('update:port', v ?? props.port)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">探测次数</label>
				<n-input-number
					:max="10"
					:min="1"
					:value="props.count"
					class="w-24"
					@update:value="(v: number | null) => emit('update:count', v ?? props.count)"
				/>
			</div>
			<span class="text-xs text-slate-400">{{ props.meta.hint }}</span>
		</div>

		<!-- ICMP 不可用：引导改用 TCP 探测 -->
		<n-alert v-if="props.mode === 'icmp' && !props.pingAvailable" class="text-sm" type="warning">
			部署服务器上未找到 ping 命令（常见于精简容器镜像），ICMP 探测不可用，请切换到「TCP 端口」方式。
		</n-alert>
	</div>
</template>
