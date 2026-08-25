<script lang="ts" setup>
	import { NAlert } from 'naive-ui';
	import type { RegexMatch } from '@/types/regex';

	defineProps<{
		matches: RegexMatch[];
		pattern: string;
		testStr: string;
		error: string;
	}>();
</script>

<template>
	<div>
		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>
		<div class="mt-5">
			<div class="flex items-center gap-2 mb-2">
				<label class="text-xs font-semibold text-slate-500">匹配结果</label>
				<span v-if="matches.length" class="text-[10px] text-slate-400">
					共匹配 <span class="font-semibold text-blue-600">{{ matches.length }}</span> 处
				</span>
			</div>
			<div v-if="matches.length" class="space-y-1">
				<div
					v-for="(m, i) in matches"
					:key="i"
					class="p-3 bg-emerald-50 rounded-lg text-sm font-mono flex gap-4 border-l-3 border-emerald-300"
				>
					<span class="text-slate-400 flex-shrink-0">[{{ i }}]</span>
					<span class="text-slate-700 font-semibold">{{ m.match }}</span>
					<span class="text-slate-400">index: {{ m.index }}</span>
					<span v-if="m.groups.length" class="text-slate-500"> groups: {{ m.groups.join(', ') }} </span>
				</div>
			</div>
			<div
				v-else-if="pattern && testStr && !error"
				class="p-3 bg-slate-50 rounded-lg text-sm text-slate-400 text-center"
			>
				无匹配结果
			</div>
			<div v-else class="p-3 bg-slate-50 rounded-lg text-sm text-slate-400 text-center">
				输入正则表达式和测试文本后将显示匹配结果
			</div>
		</div>
	</div>
</template>
