<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">关于密码安全</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			密码强度取决于<span class="font-medium text-blue-800">长度</span>与<span class="font-medium text-blue-800"
				>字符集大小</span
			>。 每增加一位长度，可能的组合数呈指数增长：一个 8 位纯数字密码仅有 1 亿种组合（约 0.27 秒可暴力破解）， 而 16
			位大小写字母+数字+符号的密码约有 10<sup>30</sup> 种组合——以当前算力暴力破解需要数亿年。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			一个好的密码应包含大小写字母、数字与特殊符号，长度不低于 12 位，且避免使用字典单词、生日、姓名等可猜测内容。
			不同网站应使用不同密码，防止一站泄露危及全部账号。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			本工具使用浏览器内置的 <code class="font-mono text-xs text-blue-800">crypto.getRandomValues</code>
			生成密码，真随机且不离开本地，不会被传输或记录。建议配合密码管理器使用，无需记忆复杂密码。
		</p>
	</div>
</template>
