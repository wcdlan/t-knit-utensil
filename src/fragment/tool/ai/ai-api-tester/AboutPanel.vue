<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于 AI API 测试</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具支持三种主流 AI API 格式：<span class="font-medium text-blue-800">OpenAI 兼容</span>（Chat Completions
			格式）、 <span class="font-medium text-blue-800">Anthropic</span>（Claude Messages API）和
			<span class="font-medium text-blue-800">Gemini</span>（Google Generative Language API），
			也适用于任何兼容这些格式的自托管或第三方代理服务（如 Groq、DeepSeek、Ollama 等）。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			「测试连接」验证 API 地址与 Key 是否可用；「获取模型列表」拉取该端点支持的模型； 「测试对话」向指定模型发送一条
			Prompt 并显示回复内容。配置可保存到浏览器本地历史，方便后续复用。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			由于浏览器跨域（CORS）限制，部分 API 服务可能直接请求失败。勾选「通过本地代理请求」后，
			请求将通过本工具的服务端转发（<code class="font-mono text-xs text-blue-800">/api/proxy</code>）， 可绕过 CORS
			限制。您的 API Key 仅用于发送测试请求，不会被持久化存储。
		</p>
	</div>
</template>
