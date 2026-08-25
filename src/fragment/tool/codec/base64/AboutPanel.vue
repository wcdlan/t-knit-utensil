<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 Base64？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			Base64 使用
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">A-Z a-z 0-9 + /</code>
			共 64 个可打印字符来表示二进制数据。每 3 个字节会被编码为 4 个字符，因此编码后的体积约为原始数据的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">4/3</code>。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			例如中文「{{ '中' }}」按 UTF-8 编码为字节序列后，对应 Base64 为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">5Lit</code>。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			它常用于在文本协议中安全传输图片、文件、证书等二进制内容（如 Data URI、邮件附件、JSON 字段），URL 场景下可使用
			URL-safe 变体（以
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">-</code>
			和
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">_</code>
			替代
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">+</code>
			和
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/</code>）。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			请注意：Base64 是<span class="font-medium text-blue-800">编码</span
			>，不是加密，任何人都可以解码得到原文，请勿用它保护敏感信息。
		</p>
	</div>
</template>
