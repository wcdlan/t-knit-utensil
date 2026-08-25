<script lang="ts" setup>
	import {
		NCollapse,
		NCollapseItem,
		NInput,
		NInputNumber,
		NSelect,
		NSwitch,
		NTooltip,
		type SelectOption
	} from 'naive-ui';
	import { obfuscatorOptionGroups } from '@/data/jsObfuscatorOptions';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { ObfuscatorOptions } from '@/types/jsObfuscator';

	const props = defineProps<{
		options: ObfuscatorOptions;
	}>();

	const emit = defineEmits<{
		'update:option': [key: string, value: string | number | boolean | string[]];
	}>();

	/** 读取选项当前值 */
	function optionValue(key: string): string | number | boolean | string[] {
		return props.options[key] ?? '';
	}

	/** 转换为 naive-ui NSelect 可接受的选项类型 */
	function selectOptions(meta: (typeof obfuscatorOptionGroups)[number]['options'][number]): SelectOption[] {
		return (meta.options ?? []).map((o) => ({ label: o.label, value: o.value }));
	}
</script>

<template>
	<!-- OptionPanel：混淆选项配置面板（紧凑多列分组折叠展示全部选项，说明悬浮提示） -->
	<div class="bg-white rounded-xl border border-slate-200/80 flex-shrink-0 overflow-hidden">
		<n-collapse :default-expanded-names="obfuscatorOptionGroups.map((g) => g.id)">
			<n-collapse-item v-for="group in obfuscatorOptionGroups" :key="group.id" :name="group.id" :title="group.name">
				<div class="grid grid-cols-1 gap-x-6 gap-y-1.5 md:grid-cols-2 xl:grid-cols-3">
					<div
						v-for="meta in group.options"
						:key="meta.key"
						class="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-slate-50/70"
					>
						<div class="flex min-w-0 flex-1 items-center gap-1.5">
							<span class="truncate text-[13px] text-slate-700">{{ meta.label }}</span>
							<n-tooltip :style="{ maxWidth: '280px' }" placement="top" trigger="hover">
								<template #trigger>
									<span class="shrink-0 text-slate-300 hover:text-blue-400 cursor-help leading-none">
										<TkuIcon :name="icons.info" :size="14" />
									</span>
								</template>
								{{ meta.description }}
							</n-tooltip>
						</div>
						<div class="shrink-0">
							<!-- 布尔开关 -->
							<n-switch
								v-if="meta.type === 'boolean'"
								:value="Boolean(optionValue(meta.key))"
								size="small"
								@update:value="(v: boolean) => emit('update:option', meta.key, v)"
							/>
							<!-- 数值输入 -->
							<n-input-number
								v-else-if="meta.type === 'number'"
								:max="meta.max"
								:min="meta.min"
								:step="meta.step"
								:value="Number(optionValue(meta.key))"
								class="!w-[110px]"
								size="small"
								@update:value="(v: number | null) => emit('update:option', meta.key, v ?? 0)"
							/>
							<!-- 文本输入 -->
							<n-input
								v-else-if="meta.type === 'string'"
								:placeholder="meta.placeholder"
								:value="String(optionValue(meta.key))"
								class="!w-[160px]"
								size="small"
								@update:value="(v: string) => emit('update:option', meta.key, v)"
							/>
							<!-- 单选下拉 -->
							<n-select
								v-else-if="meta.type === 'select'"
								:options="selectOptions(meta)"
								:value="String(optionValue(meta.key))"
								class="!w-[150px]"
								size="small"
								@update:value="(v: string) => emit('update:option', meta.key, v)"
							/>
							<!-- 多选下拉 / 字符串数组 -->
							<n-select
								v-else
								:multiple="true"
								:options="selectOptions(meta)"
								:placeholder="meta.placeholder"
								:tag="meta.type === 'string-array'"
								:value="Array.isArray(optionValue(meta.key)) ? (optionValue(meta.key) as string[]) : []"
								class="!w-[200px]"
								size="small"
								@update:value="(v: string[]) => emit('update:option', meta.key, v)"
							/>
						</div>
					</div>
				</div>
			</n-collapse-item>
		</n-collapse>
	</div>
</template>
