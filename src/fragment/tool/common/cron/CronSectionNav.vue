<script lang="ts" setup>
	import TkuIcon from '@/component/common/TkuIcon.vue';

	defineProps<{
		/** 当前激活页签 */
		modelValue: string;
		/** 页签列表 */
		items: { key: string; label: string; icon: string }[];
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();
</script>

<template>
	<!-- 工具内页签导航：解析 / 选单 / 常用列表 三块内容切换 -->
	<div class="flex flex-wrap gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-1.5">
		<button
			v-for="item in items"
			:key="item.key"
			:class="
				item.key === modelValue
					? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-100'
					: 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
			"
			class="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition"
			type="button"
			@click="emit('update:modelValue', item.key)"
		>
			<TkuIcon :name="item.icon" :size="16" />
			<span>{{ item.label }}</span>
		</button>
	</div>
</template>
