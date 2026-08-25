<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 URL 编码？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			URL 只允许使用 ASCII 字符集中的一部分安全字符。中文、空格、<code
				class="rounded bg-white/60 px-1 font-mono text-blue-700"
				>&amp;</code
			>、<code class="rounded bg-white/60 px-1 font-mono text-blue-700">=</code>
			等其它字符需要被「百分号编码」，规则是将字符按 UTF-8 编码成字节，每个字节写成
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">%XX</code>
			的形式。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			例如中文「{{ '你' }}」编码后为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">%E4%BD%A0</code>，空格对应
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">%20</code>（表单提交时也写作
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">+</code>）。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			JavaScript 提供两个常用的编码函数：<code class="rounded bg-white/60 px-1 font-mono text-blue-700"
				>encodeURIComponent</code
			>
			会对包括
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/ : ? &amp; =</code>
			在内的保留字符一并编码，适合编码 URL 的查询参数值；<code class="rounded bg-white/60 px-1 font-mono text-blue-700"
				>encodeURI</code
			>
			会保留这些字符，适合编码整个 URL。本工具使用的是前者（<code
				class="rounded bg-white/60 px-1 font-mono text-blue-700"
				>encodeURIComponent</code
			>）。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			常见应用场景：构建带中文或特殊字符的链接、传递查询参数、以及爬虫与接口调试中还原被编码的日志参数。
		</p>
	</div>
</template>
