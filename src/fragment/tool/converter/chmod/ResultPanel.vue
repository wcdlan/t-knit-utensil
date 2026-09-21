<script lang="ts" setup>
	import { NButton, NInput, NTag } from 'naive-ui';
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import type { ChmodExplainRow, ChmodSpecialMeta } from '@/types/chmod';

	const props = defineProps<{
		/** 八进制权限文本 */
		octal: string;
		/** 带文件类型位的符号表示（如 -rwxr-xr-x） */
		symbolicFull: string;
		/** 三个作用对象的权限拆解 */
		rows: ChmodExplainRow[];
		/** 已开启的特殊权限位 */
		specials: ChmodSpecialMeta[];
		/** 生成的 chmod 命令 */
		command: string;
		/** 复制用结果摘要 */
		summary: string;
		/** 命令中的目标路径 */
		target: string;
	}>();

	const emit = defineEmits<{
		'update:target': [value: string];
		copy: [value: string];
	}>();
</script>

<template>
	<div class="rounded-xl border border-slate-200 bg-white p-3.5">
		<div class="mb-2.5 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.chmod" :size="16" class="text-blue-500" />
				<h3 class="text-sm font-semibold text-slate-800">计算结果</h3>
			</div>
			<!-- 复制结果：一次性复制权限、逐位含义与命令 -->
			<n-button secondary size="tiny" @click="emit('copy', props.summary)">复制结果</n-button>
		</div>

		<!-- 八进制与符号表示：点击任意一处即复制 -->
		<div class="flex flex-wrap items-center gap-2.5">
			<div
				:title="`点击复制：${props.octal}`"
				class="shrink-0 cursor-pointer rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-1.5"
				@click="emit('copy', props.octal)"
			>
				<div class="text-[11px] font-semibold text-blue-700">八进制</div>
				<div class="font-mono text-2xl font-bold leading-tight text-blue-700">{{ props.octal }}</div>
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<span
						:title="`点击复制：${props.symbolicFull}`"
						class="cursor-pointer font-mono text-lg font-semibold text-slate-700 hover:text-blue-600"
						@click="emit('copy', props.symbolicFull)"
					>
						{{ props.symbolicFull }}
					</span>
					<!-- 已开启的特殊权限位 -->
					<n-tag v-for="special in props.specials" :key="special.id" :bordered="false" size="tiny" type="warning">
						{{ special.name }}（{{ special.octalDigit }}000）
					</n-tag>
					<n-tag v-if="!props.specials.length" :bordered="false" size="tiny" type="default">无特殊位</n-tag>
				</div>
				<p class="mt-0.5 text-xs leading-relaxed text-slate-500">
					每位数字 = 该对象的 r(4) + w(2) + x(1)；符号表示里 s / S 表示 setuid / setgid，t / T 表示 sticky。
				</p>
			</div>
		</div>

		<!-- 逐位拆解 + 命令生成：超宽屏并排（左数字拆解、右命令），窄屏上下堆叠 -->
		<div
			class="mt-2.5 grid gap-2.5 border-t border-slate-100 pt-2.5 min-[1800px]:grid-cols-[minmax(0,1fr)_minmax(0,340px)]"
		>
			<!-- 逐位拆解：所有者 / 所属组 / 其他用户 -->
			<div class="grid gap-2 sm:grid-cols-3">
				<div
					v-for="row in props.rows"
					:key="row.label"
					class="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-1.5"
				>
					<div class="flex items-center justify-between gap-2">
						<span class="text-xs font-semibold text-slate-500">{{ row.label }}</span>
						<span class="font-mono text-base font-bold leading-tight text-slate-700">{{ row.digit }}</span>
					</div>
					<div class="mt-0.5 flex flex-wrap items-baseline gap-x-2">
						<span
							:title="`点击复制：${row.symbolic}`"
							class="cursor-pointer font-mono text-sm font-semibold text-blue-600 hover:text-blue-700"
							@click="emit('copy', row.symbolic)"
						>
							{{ row.symbolic }}
						</span>
						<span class="font-mono text-[11px] text-slate-400">{{ row.formula }}</span>
					</div>
					<div class="mt-0.5 text-xs text-slate-600">{{ row.description }}</div>
				</div>
			</div>

			<!-- 命令生成：目标路径输入 + 可直接执行的 chmod 命令 -->
			<div>
				<div class="mb-1.5 flex flex-wrap items-center justify-between gap-2">
					<span class="text-xs font-semibold text-slate-500">chmod 命令（可选目标路径）</span>
					<span class="text-[11px] text-slate-400">递归修改加 -R</span>
				</div>
				<n-input
					:input-props="{ class: 'font-mono text-sm' }"
					:value="props.target"
					class="!w-full max-w-[520px]"
					placeholder="如 ./deploy.sh 或 /var/www"
					size="small"
					@update:value="(v: string) => emit('update:target', v)"
				/>
				<!-- 命令文本：点击即复制，长路径自动换行不截断 -->
				<div
					:title="`点击复制：${props.command}`"
					class="mt-1.5 cursor-pointer break-all rounded-md bg-slate-900 px-2.5 py-1.5 font-mono text-xs leading-relaxed text-slate-100 hover:bg-slate-800"
					@click="emit('copy', props.command)"
				>
					{{ props.command }}
				</div>
			</div>
		</div>
	</div>
</template>
