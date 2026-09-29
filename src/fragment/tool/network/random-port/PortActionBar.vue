<script lang="ts" setup>
	import { NButton } from 'naive-ui';
	import TkuIcon from '@/component/common/TkuIcon.vue';
	import { icons } from '@/data/icons';
	import type { RandomPortEntry } from '@/types/port';

	const props = defineProps<{
		/** 当前生成的端口列表 */
		entries: RandomPortEntry[];
	}>();

	const emit = defineEmits<{
		generate: [];
		copyList: [];
		copyCsv: [];
	}>();
</script>

<template>
	<div class="flex flex-wrap gap-2">
		<n-button type="primary" @click="emit('generate')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.randomPort" :size="16" />
				<span>重新生成</span>
			</span>
		</n-button>
		<n-button :disabled="!props.entries.length" secondary @click="emit('copyList')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.clipboard" :size="16" />
				<span>复制（换行）</span>
			</span>
		</n-button>
		<n-button :disabled="!props.entries.length" secondary @click="emit('copyCsv')">
			<span class="flex items-center gap-1.5">
				<TkuIcon :name="icons.clipboard" :size="16" />
				<span>复制（逗号）</span>
			</span>
		</n-button>
	</div>
</template>
