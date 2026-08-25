<template>
	<!-- AboutPanel：JS 混淆工具简介与使用说明 -->
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex-shrink-0">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 JS 混淆？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			JavaScript
			混淆是在不改动程序行为的前提下，将源码转换为难以阅读、难以逆向的形式：变量函数重命名、字符串加密、控制流平坦化、死代码注入、调试保护等，常用于前端代码保护、防止抄袭与破解。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			本工具基于
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">javascript-obfuscator</code>
			实现，全部在浏览器本地运行，代码不会上传到任何服务器。内置低 / 中 / 高三档预设（默认低混淆），并支持
			<strong>微调全部混淆选项</strong>：压缩输出、标识符命名、字符串数组、控制流平坦化、死代码注入、反调试保护等。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			<strong>提示：</strong
			>混淆强度越高，产物体积与运行开销越大，并可能触发浏览器安全告警；请按实际场景选择。混淆后建议先在目标环境执行验证功能是否正常。
		</p>
	</div>
</template>
