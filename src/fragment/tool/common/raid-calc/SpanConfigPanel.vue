<script lang="ts" setup>
	import { computed } from 'vue';
	import { NButton, NInputNumber, NTag } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';

	const props = defineProps<{
		/** 当前等级名称（如 RAID 50） */
		levelName: string;
		/** 子组使用的等级名称（如 RAID 5 / RAID 6） */
		subLevelName: string;
		/** 子组磁盘数 */
		spanDisks: number;
		/** 子组最少磁盘数 */
		minSpanDisks: number;
		/** 阵列磁盘数（不含热备） */
		arrayDisks: number;
	}>();

	const emit = defineEmits<{
		'update:spanDisks': [value: number];
	}>();

	/** 可选子组磁盘数：阵列磁盘数的因数，且每组至少 minSpanDisks 块、至少 2 个子组 */
	const options = computed(() => {
		const list: number[] = [];
		for (let size = props.minSpanDisks; size <= props.arrayDisks / 2; size++) {
			if (props.arrayDisks % size === 0) list.push(size);
		}
		return list;
	});

	/** 当前子组数量（磁盘数不能被整除时为 0） */
	const spans = computed(() =>
		props.spanDisks > 0 && props.arrayDisks % props.spanDisks === 0 ? props.arrayDisks / props.spanDisks : 0
	);

	/** 当前配置是否合法 */
	const valid = computed(() => spans.value >= 2 && props.spanDisks >= props.minSpanDisks);
</script>

<template>
	<div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
		<div class="mb-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TkuIcon :name="icons.subnet" :size="15" class="text-indigo-500" />
				<span class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ levelName }} 子组配置</span>
			</div>
			<n-tag :type="valid ? 'info' : 'error'" round size="tiny">
				{{ valid ? `${spans} 组 × ${spanDisks} 块` : '配置无效' }}
			</n-tag>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<div class="flex items-center gap-1.5">
				<span class="text-xs text-slate-400">每组磁盘数</span>
				<n-input-number
					:max="Math.max(minSpanDisks, arrayDisks)"
					:min="minSpanDisks"
					:precision="0"
					:step="1"
					:value="spanDisks"
					class="!w-[110px]"
					size="small"
					@update:value="(v: number | null) => emit('update:spanDisks', v ?? minSpanDisks)"
				/>
			</div>

			<!-- 合法因数快捷按钮：只列出能整除阵列磁盘数的取值 -->
			<div class="flex flex-wrap gap-1">
				<n-button
					v-for="size in options"
					:key="size"
					:type="spanDisks === size ? 'primary' : 'default'"
					size="tiny"
					@click="emit('update:spanDisks', size)"
				>
					{{ size }}
				</n-button>
			</div>
		</div>

		<p class="mt-1.5 text-[10px] leading-relaxed text-slate-400">
			{{ levelName }} 由多个 {{ subLevelName }} 子组条带而成：阵列磁盘数需为每组磁盘数的整数倍，且至少 2
			个子组（当前阵列磁盘 {{ arrayDisks }} 块{{
				options.length ? `，可选 ${options.join(' / ')}` : '，无合法子组配置'
			}}）。
		</p>
	</div>
</template>
