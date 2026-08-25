<script lang="ts" setup>
	import { NCollapse, NCollapseItem } from 'naive-ui';
	import type { CharGroup } from '@/types/regex';

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
</template>
