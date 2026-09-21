<script lang="ts" setup>
	import { NCheckbox } from 'naive-ui';
	import { CHMOD_BITS, CHMOD_CLASSES, CHMOD_SPECIALS, getClassDigit, hasBit, hasSpecial } from '@/utils/chmod';
	import type { ChmodBitId, ChmodClassId, ChmodSpecialId } from '@/types/chmod';

	const props = defineProps<{
		/** 当前权限值（0 ~ 0o7777） */
		mode: number;
	}>();

	const emit = defineEmits<{
		toggleBit: [classId: ChmodClassId, bit: ChmodBitId];
		toggleSpecial: [id: ChmodSpecialId];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-3.5">
		<div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-sm font-semibold text-slate-800">权限勾选</h3>
			<span class="text-[11px] text-slate-400">勾选后自动换算数字</span>
		</div>

		<!-- 表头：作用对象 + 三个权限位 + 该对象的八进制数字 -->
		<div
			class="grid grid-cols-[minmax(0,1fr)_repeat(3,38px)_34px] items-center gap-1 pb-1 text-[11px] font-medium text-slate-400 sm:grid-cols-[minmax(0,1fr)_repeat(3,46px)_38px]"
		>
			<span>作用对象</span>
			<span v-for="bit in CHMOD_BITS" :key="bit.id" class="text-center">{{ bit.letter }} {{ bit.value }}</span>
			<span class="text-center">数字</span>
		</div>

		<!-- 所有者 / 所属组 / 其他用户三行权限位 -->
		<div
			v-for="meta in CHMOD_CLASSES"
			:key="meta.id"
			class="grid grid-cols-[minmax(0,1fr)_repeat(3,38px)_34px] items-center gap-1 border-t border-slate-100 py-1.5 sm:grid-cols-[minmax(0,1fr)_repeat(3,46px)_38px]"
		>
			<div class="min-w-0">
				<div class="text-xs text-slate-700">{{ meta.name }}</div>
				<div :title="meta.hint" class="truncate text-[10px] text-slate-400">{{ meta.hint }}</div>
			</div>
			<div v-for="bit in CHMOD_BITS" :key="bit.id" :title="bit.hint" class="flex justify-center">
				<n-checkbox
					:checked="hasBit(props.mode, meta.id, bit.id)"
					@update:checked="() => emit('toggleBit', meta.id, bit.id)"
				/>
			</div>
			<span class="text-center font-mono text-sm font-semibold text-blue-600">{{
				getClassDigit(props.mode, meta.id)
			}}</span>
		</div>

		<!-- 特殊权限位：setuid / setgid / sticky -->
		<div class="mt-2.5 border-t border-slate-100 pt-2.5">
			<div class="mb-1.5 text-xs font-semibold text-slate-500">特殊权限位（第四位数字）</div>
			<div class="flex flex-wrap gap-x-4 gap-y-1.5">
				<label
					v-for="special in CHMOD_SPECIALS"
					:key="special.id"
					:title="special.hint"
					class="flex cursor-pointer items-center gap-1.5"
				>
					<n-checkbox
						:checked="hasSpecial(props.mode, special.id)"
						@update:checked="() => emit('toggleSpecial', special.id)"
					/>
					<span class="text-xs text-slate-600">
						{{ special.name }}
						<span class="font-mono text-slate-400">（{{ special.octalDigit }}000）</span>
					</span>
				</label>
			</div>
		</div>
	</div>
</template>
