<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是编码转换？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			同一段字节序列，用不同的字符集去解读，会得到完全不同的文字。例如中文「{{ '中' }}」按 UTF-8 编码为字节
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">E4 B8 AD</code>；若误用 GBK 去解码，就会显示成
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">涓</code>——这就是常见的「乱码」。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			本工具将输入文本按
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">输入编码</code>
			转成字节，再用下方的
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">12</code>
			种常见字符集逐一解码，让你一眼看到同一份文本在各种编码下的真实效果。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			常见应用场景：排查网页或数据库乱码、判断文本的真实编码、在不同系统间搬运含中文的文件。
		</p>
	</div>
</template>
