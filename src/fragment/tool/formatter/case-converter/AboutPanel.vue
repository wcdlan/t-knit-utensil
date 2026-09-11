<template>
	<!-- 关于变量名格式转换 -->
	<div class="flex-shrink-0 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是变量名格式转换？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			不同语言、框架与场景对变量命名有各自的约定：
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">camelCase</code>
			常见于 JavaScript / Java，<code class="rounded bg-white/60 px-1 font-mono text-blue-700">snake_case</code> 常见于
			Python / 数据库字段，<code class="rounded bg-white/60 px-1 font-mono text-blue-700">kebab-case</code>
			则用于 URL、CSS 类名与文件名。项目间数据对接时常需要来回转换。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			输入任意格式的变量名，工具会自动解析其中的单词，识别当前命中的格式，并一次性列出
			<strong class="text-blue-800">camelCase、PascalCase、snake_case、SCREAMING_SNAKE_CASE、kebab-case</strong>
			等 11 种常用格式的结果，点击即可复制。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			常见应用场景：前端与 Python 后端字段对接、编写跨语言 SDK、批量重命名 CSS 类或常量。
		</p>
	</div>
</template>
