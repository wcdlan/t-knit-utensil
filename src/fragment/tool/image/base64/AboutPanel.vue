<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是图片 Base64？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			将图片文件编码为 Base64 后，可以<b>直接嵌入</b>到 HTML、CSS、JSON 等文本格式中，
			省去额外的图片请求，常用于小图标、邮件签名、接口传参等场景。 Data URI 格式为
			<code class="rounded bg-white/60 px-1 font-mono text-xs text-blue-700">data:image/png;base64,xxxx</code>。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			复制 Base64 时可通过<b>「携带文件头」</b>开关选择是否带上
			<code class="rounded bg-white/60 px-1 font-mono text-xs text-blue-700">data:image/xxx;base64,</code>
			前缀：需要直接用于图片 src 或粘贴到浏览器地址栏时请开启，仅需纯数据（如存入数据库字段）时请关闭。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			注意：Base64 会使体积膨胀约
			<code class="rounded bg-white/60 px-1 font-mono text-xs text-blue-700">1/3</code
			>，不适合超大图片；且它是<b>编码</b>而非加密，请勿用于保护敏感内容。
		</p>
	</div>
</template>
