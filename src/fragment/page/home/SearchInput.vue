<script lang="ts" setup>
	import { computed } from 'vue';
	import { NInput } from 'naive-ui';

	const props = defineProps<{
		modelValue: string;
		toolCount: number;
	}>();

	const emit = defineEmits<{
		'update:modelValue': [value: string];
	}>();

	const value = computed({
		get: () => props.modelValue,
		set: (v: string) => emit('update:modelValue', v)
	});
</script>

<template>
	<!-- 搜索框：按名称 / 描述过滤工具 -->
	<div class="mt-6 w-full max-w-lg">
		<n-input
			v-model:value="value"
			:placeholder="`搜索 ${props.toolCount} 个工具...`"
			class="search-input"
			clearable
			size="large"
		/>
	</div>
</template>
