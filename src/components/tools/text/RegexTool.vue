<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import { NAlert, NCollapse, NCollapseItem, NInput, NSelect, NTag } from 'naive-ui';
	import type { CharGroup, CommonPattern, RegexMatch } from '@/types/regex';

	const pattern = ref('');
	const flags = ref('g');
	const testStr = ref('');
	const error = ref('');

	const matches = computed(() => {
		error.value = '';
		if (!pattern.value || !testStr.value) return [];
		try {
			const re = new RegExp(pattern.value, flags.value);
			const results: RegexMatch[] = [];
			let m: RegExpExecArray | null;
			if (flags.value.includes('g')) {
				while ((m = re.exec(testStr.value)) !== null) {
					results.push({ match: m[0], index: m.index, groups: m.slice(1) });
					if (m[0] === '') {
						re.lastIndex++;
						if (re.lastIndex > testStr.value.length) break;
					}
				}
			} else {
				m = re.exec(testStr.value);
				if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1) });
			}
			return results;
		} catch (e) {
			error.value = '正则表达式错误: ' + (e as Error).message;
			return [];
		}
	});

	const flagOptions = [
		{ value: 'g', label: 'g (全局)' },
		{ value: 'i', label: 'i (忽略大小写)' },
		{ value: 'm', label: 'm (多行)' },
		{ value: 's', label: 's (点匹配换行)' },
		{ value: 'gi', label: 'gi' },
		{ value: 'gm', label: 'gm' },
		{ value: 'gim', label: 'gim' },
		{ value: 'gis', label: 'gis' }
	];

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

	function selectPattern(p: CommonPattern) {
		pattern.value = p.pattern;
	}

	const charGroups: CharGroup[] = [
		{
			title: '定位符',
			items: [
				{ char: '.', desc: '匹配除换行符外的任意单个字符' },
				{ char: '^', desc: '匹配字符串开头（多行模式匹配行首）' },
				{ char: '$', desc: '匹配字符串结尾（多行模式匹配行尾）' }
			]
		},
		{
			title: '量词',
			items: [
				{ char: '*', desc: '匹配前一个字符 0 次或多次（贪婪）' },
				{ char: '+', desc: '匹配前一个字符 1 次或多次（贪婪）' },
				{ char: '?', desc: '匹配前一个字符 0 次或 1 次；跟在量词后为非贪婪' },
				{ char: '{n}', desc: '精确匹配前一个字符 n 次' },
				{ char: '{n,}', desc: '匹配前一个字符至少 n 次' },
				{ char: '{n,m}', desc: '匹配前一个字符 n 到 m 次' }
			]
		},
		{
			title: '分组与字符类',
			items: [
				{ char: '|', desc: '或，匹配左右任意一个表达式' },
				{ char: '()', desc: '捕获组，提取匹配子串，\\1 \\2 反向引用' },
				{ char: '(?:)', desc: '非捕获组，仅分组不提取' },
				{ char: '[]', desc: '字符类，匹配方括号内任意一个字符' },
				{ char: '[^]', desc: '否定字符类，匹配不在方括号内的任意字符' }
			]
		},
		{
			title: '转义字符',
			items: [
				{ char: '\\d', desc: '任意数字，等价于 [0-9]' },
				{ char: '\\D', desc: '任意非数字，等价于 [^0-9]' },
				{ char: '\\w', desc: '单词字符（字母、数字、下划线）' },
				{ char: '\\W', desc: '非单词字符' },
				{ char: '\\s', desc: '空白字符（空格、Tab、换行等）' },
				{ char: '\\S', desc: '非空白字符' }
			]
		},
		{
			title: '边界',
			items: [
				{ char: '\\b', desc: '单词边界，匹配单词开头或结尾的位置' },
				{ char: '\\B', desc: '非单词边界' }
			]
		},
		{
			title: '控制字符',
			items: [
				{ char: '\\n', desc: '匹配换行符 (LF)' },
				{ char: '\\r', desc: '匹配回车符 (CR)' },
				{ char: '\\t', desc: '匹配制表符 (Tab)' }
			]
		},
		{
			title: '前瞻/后顾',
			items: [
				{ char: '(?=)', desc: '正向前瞻，后面须跟指定表达式但不消耗字符' },
				{ char: '(?!)', desc: '负向前瞻，后面不能跟指定表达式' },
				{ char: '(?<=)', desc: '正向后顾，前面须是指定表达式（ES2018+）' },
				{ char: '(?<!)', desc: '负向后顾，前面不能是指定表达式（ES2018+）' }
			]
		}
	];
</script>

<template>
	<div class="space-y-5">
		<!-- Pattern -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-2">正则表达式</label>
			<div class="flex gap-2">
				<n-input v-model:value="pattern" class="flex-1 !font-mono" placeholder="输入正则表达式">
					<template #prefix>
						<span class="text-slate-400 font-mono">/</span>
					</template>
					<template #suffix>
						<span class="text-slate-400 font-mono">/</span>
					</template>
				</n-input>
				<n-select v-model:value="flags" :options="flagOptions" class="!w-[140px] !max-w-full" />
			</div>
		</div>

		<!-- Common Patterns -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-2">常用正则</label>
			<div class="flex flex-wrap gap-1.5">
				<n-tag
					v-for="p in commonPatterns"
					:key="p.label"
					:type="pattern === p.pattern ? 'primary' : 'default'"
					class="cursor-pointer"
					@click="selectPattern(p)"
				>
					{{ p.label }}
				</n-tag>
			</div>
		</div>

		<!-- Test String -->
		<div>
			<label class="block text-xs font-semibold text-slate-500 mb-2">测试文本</label>
			<n-input v-model:value="testStr" :autosize="{ minRows: 6 }" placeholder="输入要测试的文本..." type="textarea" />
		</div>

		<!-- Error -->
		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>

		<!-- Results -->
		<div>
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

		<!-- 特殊字符速查表 - 分组多列布局 -->
		<n-collapse :defaultExpandedNames="['ref']" class="mt-6">
			<n-collapse-item name="ref" title="特殊字符速查表">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
					<div v-for="group in charGroups" :key="group.title">
						<div class="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
							{{ group.title }}
						</div>
						<div class="space-y-0.5">
							<div
								v-for="item in group.items"
								:key="item.char"
								class="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-slate-50"
							>
								<code class="font-mono text-blue-600 text-xs whitespace-nowrap shrink-0 min-w-[48px]">{{
									item.char
								}}</code>
								<span class="text-slate-600 text-xs leading-snug">{{ item.desc }}</span>
							</div>
						</div>
					</div>
				</div>
			</n-collapse-item>
		</n-collapse>

		<!-- About regex -->
		<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
			<h3 class="text-sm font-semibold text-blue-800 mb-3">关于正则表达式</h3>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				正则表达式（Regular Expression）是用模式字符串匹配文本的强大工具。它由<span class="font-medium text-blue-800"
					>普通字符</span
				>（精确匹配）与 <span class="font-medium text-blue-800">元字符</span>（如
				<code class="font-mono text-xs text-blue-800">\d</code>、<code class="font-mono text-xs text-blue-800">*</code
				>、<code class="font-mono text-xs text-blue-800">+</code> 等特殊含义字符）组成，
				几乎所有编程语言和文本编辑器都支持这一语法。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed mb-2">
				常用场景：表单校验（邮箱、手机号、身份证格式）、日志分析中提取特定模式的数据、
				代码批量搜索替换、以及爬虫与数据处理中的文本抽取。一个写好的正则往往比手写几十行解析代码更高效可靠。
			</p>
			<p class="text-sm text-slate-600 leading-relaxed">
				编写正则时注意区分<span class="font-medium text-blue-800">贪婪</span>与<span class="font-medium text-blue-800"
					>非贪婪</span
				>模式（<code class="font-mono text-xs text-blue-800">*?</code>、<code class="font-mono text-xs text-blue-800"
					>+?</code
				>）， 并留意回溯陷阱——过于复杂的正则可能导致性能问题甚至是灾难性回溯（Catastrophic Backtracking）。
				本工具纯前端计算，测试文本不会上传。
			</p>
		</div>
	</div>
</template>
