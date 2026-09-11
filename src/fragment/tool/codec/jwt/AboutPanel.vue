<template>
	<!-- 关于 JWT -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 JWT？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			JWT（JSON Web Token）是一种紧凑的令牌格式，由三段用点号连接的内容组成：<code
				class="rounded bg-white/60 px-1 font-mono text-red-600"
				>Header</code
			>.<code class="rounded bg-white/60 px-1 font-mono text-purple-600">Payload</code>.<code
				class="rounded bg-white/60 px-1 font-mono text-blue-600"
				>Signature</code
			>。前两段是 JSON 经 <strong class="text-blue-800">Base64URL</strong> 编码的结果，最后一段是签名。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			Header 描述签名算法（如 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">HS256</code>），Payload
			携带声明（claims）——包括 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">iss</code> /
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">sub</code> /
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">exp</code> 等标准声明与业务自定义字段。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">解析</span>会拆解三段并解读标准声明、换算时间字段；<span
				class="font-medium text-blue-800"
				>生成</span
			>则按所选 HMAC 算法对 Header 与 Payload 签名，产出完整 token。校验签名需要密钥，工具在浏览器本地用 Web Crypto
			完成，密钥不会离开当前页面。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-amber-700">安全提示</span>：JWT 的 Payload 只是 Base64URL
			编码，<strong>任何人都能解开看到内容</strong>，切勿把密码、身份证号等敏感信息放进 Payload。
		</p>
	</div>
</template>
