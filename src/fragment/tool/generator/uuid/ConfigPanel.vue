<script lang="ts" setup>
	import { NCheckbox, NInput, NInputNumber, NSelect, type SelectOption } from 'naive-ui';
	import type { NamespaceKey, UuidVersion } from '@/types/uuid';

	const props = defineProps<{
		version: UuidVersion;
		count: number;
		uppercase: boolean;
		name: string;
		namespace: NamespaceKey;
		customNamespace: string;
		nsError: string;
		nameBased: boolean;
	}>();

	const emit = defineEmits<{
		'update:version': [value: UuidVersion];
		'update:count': [value: number];
		'update:uppercase': [value: boolean];
		'update:name': [value: string];
		'update:namespace': [value: NamespaceKey];
		'update:customNamespace': [value: string];
	}>();

	const versionOptions: SelectOption[] = [
		{ label: 'v1（时间 + 节点）', value: 'v1' },
		{ label: 'v3（MD5 命名空间）', value: 'v3' },
		{ label: 'v4（随机）', value: 'v4' },
		{ label: 'v5（SHA-1 命名空间）', value: 'v5' },
		{ label: 'v6（有序时间）', value: 'v6' },
		{ label: 'v7（时间戳 + 随机）', value: 'v7' }
	];

	const namespaceOptions: SelectOption[] = [
		{ label: 'DNS', value: 'dns' },
		{ label: 'URL', value: 'url' },
		{ label: 'OID', value: 'oid' },
		{ label: 'X.500', value: 'x500' },
		{ label: '自定义', value: 'custom' }
	];
</script>

<template>
	<div class="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
		<span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">生成配置</span>

		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">UUID 版本</span>
				<n-select
					:options="versionOptions"
					:value="props.version"
					class="!w-[200px] !max-w-full"
					@update:value="(v: UuidVersion) => emit('update:version', v)"
				/>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">生成数量</span>
				<n-input-number
					:max="100"
					:min="1"
					:value="props.count"
					class="w-20"
					@update:value="(v: number | null) => emit('update:count', v ?? props.count)"
				/>
			</div>
			<n-checkbox :checked="props.uppercase" @update:checked="(v: boolean) => emit('update:uppercase', v)">
				大写
			</n-checkbox>
		</div>

		<!-- v3/v5 名称化配置 -->
		<div v-if="props.nameBased" class="mt-4 flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">名称</span>
				<n-input
					:value="props.name"
					class="!w-[200px] !max-w-full"
					placeholder="任意文本"
					size="small"
					@update:value="(v: string) => emit('update:name', v)"
				/>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-semibold text-slate-500">命名空间</span>
				<n-select
					:options="namespaceOptions"
					:value="props.namespace"
					class="!w-[120px] !max-w-full"
					size="small"
					@update:value="(v: NamespaceKey) => emit('update:namespace', v)"
				/>
			</div>
		</div>

		<!-- 自定义命名空间输入 -->
		<div v-if="props.nameBased && props.namespace === 'custom'" class="mt-3 flex flex-wrap items-center gap-2">
			<n-input
				:value="props.customNamespace"
				class="!w-[260px] !max-w-full"
				placeholder="输入命名空间 UUID，例如 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
				size="small"
				@update:value="(v: string) => emit('update:customNamespace', v)"
			/>
		</div>
		<p v-if="props.nsError" class="mt-2 text-xs text-red-500">{{ props.nsError }}</p>

		<p v-if="props.nameBased" class="mt-3 text-xs text-slate-400">
			v3/v5 为确定性版本：相同的名称与命名空间必定生成相同 UUID。
		</p>
	</div>
</template>
