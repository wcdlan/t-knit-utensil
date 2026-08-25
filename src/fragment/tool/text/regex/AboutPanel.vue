<template>
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
</template>
