<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">为什么需要格式化 SQL？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			手写或从日志抓取的 SQL 往往挤在一行、大小写混乱。格式化会将
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">SELECT</code>、
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">FROM</code>、
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">WHERE</code>
			等关键字换行对齐、统一关键字大小写、对条件子句做两级缩进，让语句结构一目了然。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			压缩操作会移除多余空白，把整条语句压成一行，适合贴进脚本或作为参数传递，减小日志与请求体积。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			常见应用场景：复盘线上慢查询日志、解读 ORM 生成的 SQL、以及把多行 SQL 压缩后写入配置文件。
		</p>
	</div>
</template>
