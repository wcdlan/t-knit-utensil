<script lang="ts" setup>
	import { NButton, NInput } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';

	const props = defineProps<{
		/** 八进制权限文本（如 755 / 4755） */
		octal: string;
		/** 符号权限文本（如 rwxr-xr-x） */
		symbolic: string;
		/** 八进制输入的校验错误 */
		octalError?: string;
		/** 符号输入的校验错误 */
		symbolicError?: string;
	}>();

	const emit = defineEmits<{
		'update:octal': [value: string];
		'update:symbolic': [value: string];
		reset: [];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-3.5">
		<div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.chmod" :size="16" class="text-blue-500" />
				<h3 class="text-sm font-semibold text-slate-800">权限输入</h3>
			</div>
			<!-- 重置为普通文件默认权限 644 -->
			<n-button secondary size="tiny" @click="emit('reset')">
				<span class="flex items-center gap-1">
					<TkuIcon :name="icons.refresh" :size="14" />
					<span>重置 644</span>
				</span>
			</n-button>
		</div>

		<div class="space-y-2.5">
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">八进制（数字）</label>
				<n-input
					:input-props="{ class: 'font-mono text-sm' }"
					:status="props.octalError ? 'error' : undefined"
					:value="props.octal"
					placeholder="755"
					size="small"
					@update:value="(v: string) => emit('update:octal', v)"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-semibold text-slate-500">符号表示（字母）</label>
				<n-input
					:input-props="{ class: 'font-mono text-sm' }"
					:status="props.symbolicError ? 'error' : undefined"
					:value="props.symbolic"
					placeholder="rwxr-xr-x"
					size="small"
					@update:value="(v: string) => emit('update:symbolic', v)"
				/>
			</div>
		</div>

		<!-- 校验提示：任一侧非法时给出具体原因，两侧输入实时联动 -->
		<p v-if="props.octalError || props.symbolicError" class="mt-2 text-xs leading-relaxed text-red-600">
			{{ props.octalError || props.symbolicError }}
		</p>
		<p v-else class="mt-2 text-[11px] leading-relaxed text-slate-400">
			两种写法实时联动，也可在右侧直接勾选权限位；支持 0755 / 0o755 与带类型位的 -rwxr-xr-x
		</p>
	</div>
</template>
