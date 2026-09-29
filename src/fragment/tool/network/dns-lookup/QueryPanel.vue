<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { DnsToolMeta } from '@/types/dns';

	const props = defineProps<{
		/** 当前子工具元数据（提供标签、占位符、说明与示例） */
		meta: DnsToolMeta;
		/** 查询目标（域名或 IP） */
		value: string;
		/** 是否正在查询 */
		loading: boolean;
	}>();

	const emit = defineEmits<{
		'update:value': [value: string];
		submit: [];
	}>();
</script>

<template>
	<div>
		<div class="mb-2 flex items-center justify-between">
			<label class="text-xs font-semibold text-slate-500">{{ props.meta.inputLabel }}</label>
			<span class="text-[10px] tabular-nums text-slate-400">{{ props.value.length }} 字符</span>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- 查询目标输入框：回车即触发查询 -->
			<n-input
				:placeholder="props.meta.placeholder"
				:value="props.value"
				class="!font-mono min-w-64 flex-1"
				clearable
				@keyup.enter="emit('submit')"
				@update:value="(v: string) => emit('update:value', v)"
			>
				<template #prefix>
					<TkuIcon :name="props.meta.key === 'PTR' ? icons.ptr : icons.domain" :size="16" class="text-slate-400" />
				</template>
			</n-input>
			<n-button :loading="props.loading" type="primary" @click="emit('submit')">
				<span class="flex items-center gap-1.5">
					<TkuIcon :name="icons.magnify" :size="16" />
					<span>查询</span>
				</span>
			</n-button>
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-2">
			<span class="text-xs text-slate-400">示例：</span>
			<n-button
				v-for="example in props.meta.examples"
				:key="example"
				:disabled="props.loading"
				secondary
				size="tiny"
				@click="emit('update:value', example)"
			>
				{{ example }}
			</n-button>
			<span class="ml-auto text-xs text-slate-400">{{ props.meta.hint }}</span>
		</div>
	</div>
</template>
