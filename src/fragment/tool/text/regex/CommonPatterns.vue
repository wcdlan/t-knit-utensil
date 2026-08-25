<script lang="ts" setup>
	import { NTag } from 'naive-ui';
	import type { CommonPattern } from '@/types/regex';

	const props = defineProps<{
		pattern: string;
	}>();

	const emit = defineEmits<{
		select: [pattern: string];
	}>();

	const commonPatterns: CommonPattern[] = [
		{ label: '邮箱', pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$' },
		{ label: '手机号(中国)', pattern: '^1[3-9]\\d{9}$' },
		{ label: '固定电话', pattern: '^\\d{3,4}-\\d{7,8}$' },
		{ label: 'URL', pattern: 'https?://[\\w.-]+(:\\d+)?(/[\\w./%-]*)?' },
		{ label: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
		{ label: '身份证号', pattern: '\\d{17}[\\dXx]' },
		{ label: '邮政编码', pattern: '^\\d{6}$' },
		{ label: '中文汉字', pattern: '[\\u4e00-\\u9fa5]+' },
		{ label: '纯数字', pattern: '^\\d+$' },
		{ label: '英文字母', pattern: '^[a-zA-Z]+$' },
		{ label: '字母或数字', pattern: '^\\w+$' },
		{ label: '日期(YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
		{ label: '十六进制颜色值', pattern: '^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$' },
		{ label: '行首空白行', pattern: '^\\s*$' },
		{ label: 'HTML标签', pattern: '<[^>]+>' }
	];
</script>

<template>
	<div>
		<label class="block text-xs font-semibold text-slate-500 mb-2">常用正则</label>
		<div class="flex flex-wrap gap-1.5">
			<n-tag
				v-for="p in commonPatterns"
				:key="p.label"
				:type="props.pattern === p.pattern ? 'primary' : 'default'"
				class="cursor-pointer"
				@click="emit('select', p.pattern)"
			>
				{{ p.label }}
			</n-tag>
		</div>
	</div>
</template>
