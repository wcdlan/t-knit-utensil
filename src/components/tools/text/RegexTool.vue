<script lang="ts" setup>
	import { computed, ref } from 'vue'

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
		{ value: 's', label: 's (点匹配换行)' }
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
</script>

<template>
	<div class="space-y-4">
		<!-- Pattern -->
		<div>
			<label class="block text-xs font-semibold text-gray-500 mb-1">正则表达式</label>
			<div class="flex gap-2">
				<span class="flex items-center px-3 bg-gray-100 rounded-lg text-gray-400 font-mono">/</span>
				<input
					v-model="pattern"
					class="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
					placeholder="输入正则表达式"
				/>
				<span class="flex items-center px-3 bg-gray-100 rounded-lg text-gray-400 font-mono">/</span>
				<select
					v-model="flags"
					class="p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
				>
					<option v-for="f in flagOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
					<option value="gi">gi</option>
					<option value="gm">gm</option>
					<option value="gim">gim</option>
					<option value="gis">gis</option>
				</select>
			</div>
		</div>

		<!-- Common Patterns -->
		<div>
			<label class="block text-xs font-semibold text-gray-500 mb-1">常用正则</label>
			<div class="flex flex-wrap gap-1.5">
				<button
					v-for="p in commonPatterns"
					:key="p.label"
					:class="
						pattern === p.pattern
							? 'bg-blue-100 border-blue-300 text-blue-700'
							: 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
					"
					class="px-2.5 py-1 text-xs rounded-md border transition-colors"
					@click="selectPattern(p)"
				>
					{{ p.label }}
				</button>
			</div>
		</div>

		<!-- Test String -->
		<div>
			<label class="block text-xs font-semibold text-gray-500 mb-1">测试文本</label>
			<textarea
				v-model="testStr"
				class="w-full p-3 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
				placeholder="输入要测试的文本..."
				rows="6"
			></textarea>
		</div>

		<!-- Error -->
		<div v-if="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
			{{ error }}
		</div>

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
		<div v-else-if="pattern && testStr && !error" class="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
			无匹配结果
		</div>

		<!-- Special Chars Reference -->
		<details class="mt-6" open>
			<summary class="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 select-none">
				特殊字符速查表
			</summary>
			<div class="mt-2 overflow-hidden rounded-lg border border-gray-200">
				<table class="w-full text-xs">
					<thead>
						<tr class="bg-gray-50">
							<th class="px-3 py-2 text-left font-semibold text-gray-600 w-24">字符</th>
							<th class="px-3 py-2 text-left font-semibold text-gray-600">说明</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						<tr v-for="s in specialChars" :key="s.char" class="hover:bg-gray-50">
							<td class="px-3 py-1.5 font-mono text-blue-600 align-top">{{ s.char }}</td>
							<td class="px-3 py-1.5 text-gray-600">{{ s.desc }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</details>
	</div>
</template>
