<script lang="ts" setup>
	import { NAlert, NButton, NInputNumber, NRadioButton, NRadioGroup, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { RaidSpareScope } from '@/types/raid';

	defineProps<{
		/** 热备盘数量 */
		hotSpareCount: number;
		/** 热备盘数量上限（磁盘总数 - 1，至少保留 1 块阵列盘） */
		maxSpare: number;
		/** 热备盘作用范围 */
		spareScope: RaidSpareScope;
		/** 热备容量展示文案（已格式化） */
		spareCapacity: string;
		/** 阵列磁盘数（总磁盘数 - 热备数） */
		arrayDisks: number;
	}>();

	const emit = defineEmits<{
		'update:hotSpareCount': [value: number];
		'update:spareScope': [value: RaidSpareScope];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
		<div class="mb-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.shieldCheck" :size="15" class="text-emerald-500" />
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">热备盘（Hot Spare）</span>
			</div>
			<n-tag :type="hotSpareCount > 0 ? 'success' : 'default'" round size="tiny">
				{{ hotSpareCount > 0 ? `已启用 ${hotSpareCount} 块` : '未启用' }}
			</n-tag>
		</div>

		<!-- 表单行：标签左、控件右 -->
		<div class="space-y-1.5">
			<div class="flex items-center justify-between gap-2">
				<span class="shrink-0 text-xs text-slate-500">热备盘数量</span>
				<div class="flex items-center gap-1">
					<n-input-number
						:max="maxSpare"
						:min="0"
						:precision="0"
						:step="1"
						:value="hotSpareCount"
						class="!w-[96px]"
						size="small"
						@update:value="(v: number | null) => emit('update:hotSpareCount', v ?? 0)"
					/>
					<span class="text-xs text-slate-400">块</span>
					<n-button
						v-for="n in [0, 1, 2]"
						:key="n"
						:disabled="n > maxSpare"
						:type="hotSpareCount === n ? 'primary' : 'default'"
						size="tiny"
						@click="emit('update:hotSpareCount', n)"
					>
						{{ n === 0 ? '关' : n }}
					</n-button>
				</div>
			</div>

			<!-- 作用范围：全局热备可服务多个阵列，专用热备只服务当前阵列 -->
			<div class="flex items-center justify-between gap-2">
				<span class="shrink-0 text-xs text-slate-500">作用范围</span>
				<n-radio-group
					:value="spareScope"
					size="small"
					@update:value="(v: RaidSpareScope) => emit('update:spareScope', v)"
				>
					<n-radio-button value="global">全局</n-radio-button>
					<n-radio-button value="dedicated">专用</n-radio-button>
				</n-radio-group>
			</div>
		</div>

		<p class="mt-2 border-t border-slate-200/70 pt-2 text-[10px] leading-relaxed text-slate-400">
			热备容量 {{ spareCapacity }} · 阵列磁盘 {{ arrayDisks }} 块；
			{{
				spareScope === 'global' ? '全局热备可顶替同一控制器下任一 RAID 组的坏盘' : '专用热备仅服务当前阵列'
			}}。热备盘不参与读写，也不计入可用容量。
		</p>

		<n-alert v-if="maxSpare === 0" class="mt-2 text-xs" type="warning">
			磁盘总数仅为 1 块，无法划出热备盘；请先增加磁盘总数。
		</n-alert>
	</div>
</template>
