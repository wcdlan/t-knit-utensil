<script lang="ts" setup>
	import { computed, h, ref } from 'vue'
	import type { DataTableColumn } from 'naive-ui'
	import { NAlert, NCollapse, NCollapseItem, NInput, NSelect, NTag } from 'naive-ui'

	const pattern = ref('')
	const flags = ref('g')
	const testStr = ref('')
	const error = ref('')

	const matches = computed(() => {
		error.value = ''
		if (!pattern.value || !testStr.value) return []
		try {
			const re = new RegExp(pattern.value, flags.value)
			const results: { match: string; index: number; groups: string[] }[] = []
			let m: RegExpExecArray | null
			if (flags.value.includes('g')) {
				while ((m = re.exec(testStr.value)) !== null) {
					results.push({ match: m[0], index: m.index, groups: m.slice(1) })
					if (m[0] === '') {
						re.lastIndex++
						if (re.lastIndex > testStr.value.length) break
					}
				}
			} else {
				m = re.exec(testStr.value)
				if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1) })
			}
			return results
		} catch (e) {
			error.value = '正则表达式错误: ' + (e as Error).message
			return []
		}
	})

	const flagOptions = [
		{ value: 'g', label: 'g (全局)' },
		{ value: 'i', label: 'i (忽略大小写)' },
		{ value: 'm', label: 'm (多行)' },
		{ value: 's', label: 's (点匹配换行)' },
		{ value: 'gi', label: 'gi' },
		{ value: 'gm', label: 'gm' },
		{ value: 'gim', label: 'gim' },
		{ value: 'gis', label: 'gis' }
	]

	const commonPatterns = [
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
	]

	function selectPattern(p: { label: string; pattern: string }) {
		pattern.value = p.pattern
	}

	const specialChars = [
		{ char: '.', desc: '匹配除换行符外的任意单个字符' },
		{ char: '^', desc: '匹配字符串的开头（多行模式下匹配行首）' },
		{ char: '$', desc: '匹配字符串的结尾（多行模式下匹配行尾）' },
		{ char: '*', desc: '匹配前一个字符 0 次或多次（贪婪）' },
		{ char: '+', desc: '匹配前一个字符 1 次或多次（贪婪）' },
		{ char: '?', desc: '匹配前一个字符 0 次或 1 次；跟在量词后表示非贪婪' },
		{ char: '|', desc: '或（alternation），匹配左右任意一个表达式' },
		{ char: '()', desc: '捕获组，提取匹配的子串，\\1 \\2 可反向引用' },
		{ char: '(?:)', desc: '非捕获组，仅分组不提取' },
		{ char: '[]', desc: '字符类，匹配方括号内的任意一个字符，如 [aeiou]' },
		{ char: '[^]', desc: '否定字符类，匹配不在方括号内的任意字符' },
		{ char: '{n}', desc: '精确匹配前一个字符 n 次' },
		{ char: '{n,}', desc: '匹配前一个字符至少 n 次' },
		{ char: '{n,m}', desc: '匹配前一个字符 n 到 m 次' },
		{ char: '\\d', desc: '匹配任意数字，等价于 [0-9]' },
		{ char: '\\D', desc: '匹配任意非数字，等价于 [^0-9]' },
		{ char: '\\w', desc: '匹配单词字符（字母、数字、下划线），等价于 [a-zA-Z0-9_]' },
		{ char: '\\W', desc: '匹配非单词字符' },
		{ char: '\\s', desc: '匹配空白字符（空格、Tab、换行等）' },
		{ char: '\\S', desc: '匹配非空白字符' },
		{ char: '\\b', desc: '单词边界，匹配单词开头或结尾的位置' },
		{ char: '\\B', desc: '非单词边界' },
		{ char: '\\n', desc: '匹配换行符 (LF)' },
		{ char: '\\r', desc: '匹配回车符 (CR)' },
		{ char: '\\t', desc: '匹配制表符 (Tab)' },
		{ char: '(?=)', desc: '正向前瞻，后面必须跟着指定表达式但不消耗字符' },
		{ char: '(?!)', desc: '负向前瞻，后面不能跟着指定表达式' },
		{ char: '(?<=)', desc: '正向后顾，前面必须是指定表达式（ES2018+）' },
		{ char: '(?<!)', desc: '负向后顾，前面不能是指定表达式（ES2018+）' }
	]

	const refColumns: DataTableColumn[] = [
		{
			title: '字符',
			key: 'char',
			width: 80,
			render: (row: any) => h('code', { class: 'font-mono text-blue-600' }, row.char)
		},
		{ title: '说明', key: 'desc' }
	]
</script>

<template>
	<div class="space-y-4">
		<!-- Pattern -->
		<div>
			<label class="block text-xs font-semibold text-gray-500 mb-1">正则表达式</label>
			<div class="flex gap-2">
				<n-input v-model:value="pattern" class="flex-1 !font-mono" placeholder="输入正则表达式">
					<template #prefix>
						<span class="text-gray-400 font-mono">/</span>
					</template>
					<template #suffix>
						<span class="text-gray-400 font-mono">/</span>
					</template>
				</n-input>
				<n-select v-model:value="flags" :options="flagOptions" class="w-[140px]" />
			</div>
		</div>

		<!-- Common Patterns -->
		<div>
			<label class="block text-xs font-semibold text-gray-500 mb-1">常用正则</label>
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
			<label class="block text-xs font-semibold text-gray-500 mb-1">测试文本</label>
			<n-input v-model:value="testStr" :autosize="{ minRows: 6 }" placeholder="输入要测试的文本..." type="textarea" />
		</div>

		<!-- Error -->
		<n-alert v-if="error" class="text-sm" type="error"> {{ error }} </n-alert>

		<!-- Results -->
		<div v-if="matches.length" class="space-y-2">
			<div class="text-sm text-gray-600">
				共匹配 <span class="font-semibold text-blue-600">{{ matches.length }}</span> 处
			</div>
			<div class="space-y-1">
				<div v-for="(m, i) in matches" :key="i" class="p-3 bg-green-50 rounded-lg text-sm font-mono flex gap-4">
					<span class="text-gray-400 flex-shrink-0">[{{ i }}]</span>
					<span class="text-gray-700 font-semibold">{{ m.match }}</span>
					<span class="text-gray-400">index: {{ m.index }}</span>
					<span v-if="m.groups.length" class="text-gray-500"> groups: {{ m.groups.join(', ') }} </span>
				</div>
			</div>
		</div>
		<n-alert v-else-if="pattern && testStr && !error" class="text-sm" type="warning"> 无匹配结果 </n-alert>

		<!-- Special Chars Reference -->
		<n-collapse class="mt-6">
			<n-collapse-item name="ref" title="特殊字符速查表">
				<n-dataTable :bordered="false" :columns="refColumns" :data="specialChars" size="small" />
			</n-collapse-item>
		</n-collapse>
	</div>
</template>
