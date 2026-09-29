<script lang="ts" setup>
	import { NCheckbox, NInputNumber, NSelect } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { PortRangeKey, PortRangePreset } from '@/types/port';

	const props = defineProps<{
		/** 端口区间预设列表（数据源来自 data/ports.ts） */
		presets: PortRangePreset[];
		/** 当前选中的区间预设键 */
		rangeKey: PortRangeKey;
		/** 起始端口（含） */
		min: number;
		/** 结束端口（含） */
		max: number;
		/** 生成数量 */
		count: number;
		/** 是否排除系统端口 */
		excludeSystem: boolean;
		/** 是否排除常用服务端口 */
		excludeCommon: boolean;
		/** 候选端口总数 */
		poolSize: number;
		/** 请求数量是否超过候选数量 */
		insufficient: boolean;
		/** 起始端口是否大于结束端口 */
		rangeInvalid: boolean;
	}>();

	const emit = defineEmits<{
		'update:rangeKey': [value: PortRangeKey];
		'update:min': [value: number];
		'update:max': [value: number];
		'update:count': [value: number];
		'update:excludeSystem': [value: boolean];
		'update:excludeCommon': [value: boolean];
	}>();

	/** 预设说明文案（自定义范围时使用兜底提示） */
	function presetDescription(): string {
		const preset = props.presets.find((item) => item.key === props.rangeKey);
		return preset ? preset.description : '';
	}
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
		<span class="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">生成配置</span>

		<div class="flex flex-wrap items-end gap-4">
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">端口区间</label>
				<n-select
					:options="props.presets.map((item) => ({ label: item.label, value: item.key }))"
					:value="props.rangeKey"
					class="w-52"
					@update:value="(v: PortRangeKey) => emit('update:rangeKey', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">起始端口</label>
				<n-input-number
					:disabled="props.rangeKey !== 'custom'"
					:max="65535"
					:min="1"
					:show-button="false"
					:value="props.min"
					class="w-28"
					@update:value="(v: number | null) => emit('update:min', v ?? props.min)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">结束端口</label>
				<n-input-number
					:disabled="props.rangeKey !== 'custom'"
					:max="65535"
					:min="1"
					:show-button="false"
					:value="props.max"
					class="w-28"
					@update:value="(v: number | null) => emit('update:max', v ?? props.max)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">生成数量</label>
				<n-input-number
					:max="100"
					:min="1"
					:value="props.count"
					class="w-24"
					@update:value="(v: number | null) => emit('update:count', v ?? props.count)"
				/>
			</div>
		</div>

		<div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
			<n-checkbox :checked="props.excludeSystem" @update:checked="(v: boolean) => emit('update:excludeSystem', v)">
				排除系统端口（1-1023，需管理员权限）
			</n-checkbox>
			<n-checkbox :checked="props.excludeCommon" @update:checked="(v: boolean) => emit('update:excludeCommon', v)">
				排除常用服务端口（下方速查表）
			</n-checkbox>
		</div>

		<div class="mt-3 border-t border-slate-200/70 pt-3">
			<p class="flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
				<TkuIcon :name="icons.info" :size="14" class="mt-0.5 shrink-0 text-slate-400" />
				<span>{{ presetDescription() }}</span>
			</p>
			<p v-if="props.rangeInvalid" class="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600">
				<TkuIcon :name="icons.alert" :size="14" class="mt-0.5 shrink-0" />
				<span>起始端口大于结束端口，生成时会自动交换两者。</span>
			</p>
			<p v-if="props.insufficient" class="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600">
				<TkuIcon :name="icons.alert" :size="14" class="mt-0.5 shrink-0" />
				<span>当前条件只剩 {{ props.poolSize }} 个候选端口，不足所请求的数量，将全部给出。</span>
			</p>
		</div>
	</div>
</template>
