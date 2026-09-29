<script lang="ts" setup>
	import { NInput, NSelect } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { DnsServerKey, DnsServerPreset } from '@/types/dns';

	const props = defineProps<{
		/** DNS 服务器预设列表 */
		presets: DnsServerPreset[];
		/** 当前选中的服务器键 */
		serverKey: DnsServerKey;
		/** 自定义服务器地址 */
		customAddress: string;
		/** 部署服务器的系统默认 DNS 列表 */
		systemServers: string[];
	}>();

	const emit = defineEmits<{
		'update:serverKey': [value: DnsServerKey];
		'update:customAddress': [value: string];
	}>();

	/** 当前预设的说明文案 */
	function currentDescription(): string {
		const preset = props.presets.find((item) => item.key === props.serverKey);
		return preset ? preset.description : '';
	}
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">解析服务器</span>
			<span class="flex items-center gap-1.5 text-xs text-slate-400">
				<TkuIcon :name="icons.serverNetwork" :size="14" />
				<span>
					系统默认 DNS：{{
						props.systemServers.length ? props.systemServers.join('、') : '未获取到（后端 API 可能未启动）'
					}}
				</span>
			</span>
		</div>

		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">DNS 服务器</label>
				<n-select
					:options="props.presets.map((item) => ({ label: item.label, value: item.key }))"
					:value="props.serverKey"
					class="w-72"
					@update:value="(v: DnsServerKey) => emit('update:serverKey', v)"
				/>
			</div>
			<div v-if="props.serverKey === 'custom'" class="min-w-64 flex-1">
				<label class="mb-1 block text-xs font-semibold text-slate-500">自定义地址（支持 IP:端口）</label>
				<n-input
					:value="props.customAddress"
					class="!font-mono"
					clearable
					placeholder="例如 10.0.0.53 或 127.0.0.1:5353"
					@update:value="(v: string) => emit('update:customAddress', v)"
				>
					<template #prefix>
						<TkuIcon :name="icons.dns" :size="16" class="text-slate-400" />
					</template>
				</n-input>
			</div>
		</div>

		<p class="mt-3 flex items-start gap-1.5 border-t border-slate-200/70 pt-3 text-xs leading-relaxed text-slate-500">
			<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0 text-slate-400" />
			<span>{{ currentDescription() }}</span>
		</p>
	</div>
</template>
