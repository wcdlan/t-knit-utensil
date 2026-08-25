<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 Unicode 转义？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			Unicode 为世界上几乎所有的字符分配了唯一的编号（码点），用十六进制表示。在 JavaScript / JSON / HTML
			中，可以将字符写成
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">\uXXXX</code>
			形式的转义序列（4 位十六进制），例如中文字符「{{ '中' }}」的码点是
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">U+4E2D</code>，写成转义即
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u4E2D</code>。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			常见的 ASCII 范围转义：换行符对应
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u000A</code>，大写字母「A」对应
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">&#92;u0041</code>。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			需要注意：Basic Multilingual Plane（BMP, U+0000 ~ U+FFFF）内的字符可以用 4 位「<code
				class="font-mono text-blue-700 bg-white/60 px-1 rounded"
				>\uXXXX</code
			>」表示。 BMP 之外的字符（如 emoji「{{ '😀' }}」）码点超过 4 位十六进制，需使用扩展写法
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">\u{XXXXX}</code>
			或「代理对」表示——本工具仅支持 BMP 内的字符。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			Unicode 转义常用于在代码、配置文件与网络协议中安全地传递特殊字符，避免字符集不兼容带来的乱码问题。
		</p>
	</div>
</template>
