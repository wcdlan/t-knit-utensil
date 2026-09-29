<script lang="ts" setup>
	import type { SelectOption } from 'naive-ui';
	import { NAlert, NButton, NInput, NSelect, NSwitch } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';

	const props = defineProps<{
		/** 目标主机名或 IP */
		host: string;
		/** 最大跳数 */
		maxHops: number;
		/** 每跳探测次数 */
		probes: number;
		/** 是否反查各跳主机名 */
		resolveNames: boolean;
		/** 是否正在追踪 */
		loading: boolean;
		/** 服务端是否具备 traceroute / tracert 命令 */
		available: boolean;
		/** 服务端实际使用的命令 */
		command: string | null;
		/** 示例目标 */
		examples: string[];
		/** 最大跳数选项 */
		maxHopOptions: SelectOption[];
		/** 每跳探测次数选项 */
		probeOptions: SelectOption[];
	}>();

	const emit = defineEmits<{
		'update:host': [value: string];
		'update:maxHops': [value: number];
		'update:probes': [value: number];
		'update:resolveNames': [value: boolean];
		start: [];
	}>();
</script>

<template>
	<div class="space-y-3">
		<div>
			<div class="mb-2 flex items-center justify-between">
				<label class="text-xs font-semibold text-slate-500">目标主机名或 IP</label>
				<span class="text-[10px] tabular-nums text-slate-400">{{ props.host.length }} 字符</span>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<!-- 目标输入框：回车即开始追踪 -->
				<n-input
					:value="props.host"
					class="!font-mono min-w-64 flex-1"
					clearable
					placeholder="例如 example.com 或 223.5.5.5"
					@keyup.enter="emit('start')"
					@update:value="(v: string) => emit('update:host', v)"
				>
					<template #prefix>
						<TkuIcon :name="icons.domain" :size="16" class="text-slate-400" />
					</template>
				</n-input>
				<n-button :loading="props.loading" type="primary" @click="emit('start')">
					<span class="flex items-center gap-1.5">
						<TkuIcon :name="icons.traceroute" :size="16" />
						<span>开始追踪</span>
					</span>
				</n-button>
			</div>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<span class="text-xs text-slate-400">示例：</span>
				<n-button
					v-for="example in props.examples"
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
				<label class="mb-1 block text-xs font-semibold text-slate-500">最大跳数</label>
				<n-select
					:options="props.maxHopOptions"
					:value="props.maxHops"
					class="w-32"
					@update:value="(v: number) => emit('update:maxHops', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">每跳探测次数</label>
				<n-select
					:options="props.probeOptions"
					:value="props.probes"
					class="w-36"
					@update:value="(v: number) => emit('update:probes', v)"
				/>
			</div>
			<div class="flex items-center gap-2 pb-1.5">
				<n-switch :value="props.resolveNames" @update:value="(v: boolean) => emit('update:resolveNames', v)" />
				<span class="text-xs font-semibold text-slate-500">反查各跳主机名（PTR）</span>
			</div>
			<span class="text-xs text-slate-400">
				跳数越多越能追踪远端路径；无响应目标会按「跳数 × 探测次数 × 2 秒」等待
			</span>
		</div>

		<!-- 服务端缺少 traceroute 命令：给出安装提示 -->
		<n-alert v-if="!props.available" class="text-sm" type="warning">
			部署服务器上未找到 traceroute / tracert 命令，无法执行路由追踪。Linux 可执行
			<code class="font-mono">apk add traceroute</code>（Alpine）或
			<code class="font-mono">apt install traceroute</code>（Debian/Ubuntu）；容器需具备 NET_RAW 能力。
		</n-alert>
		<p v-else-if="props.command" class="text-xs text-slate-400">
			服务端命令：<code class="font-mono">{{ props.command }}</code>
		</p>
	</div>
</template>
