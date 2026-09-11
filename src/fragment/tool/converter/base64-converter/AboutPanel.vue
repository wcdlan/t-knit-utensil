<template>
	<!-- 关于 Base64 转换 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">Base64 能做什么？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			Base64 用 64 个可打印字符表示任意二进制数据，常用于在文本协议中传输图片、文档、压缩包等
			<strong class="text-blue-800">非文本文件</strong>——例如接口字段、JSON 配置、邮件附件与
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">data: URI</code>。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">文本转换</span>：把普通文本按 UTF-8 编码成 Base64（支持中文与
			emoji），或把 Base64 解码回文本，输入即出结果，可实时互换方向。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">文件转换</span>：选择任意本地文件（图片 / PDF / Office / 压缩包 /
			音视频等）一键转为 Base64；反向粘贴 Base64 后自动识别文件类型（PNG / JPEG / PDF / ZIP
			等魔数），可预览并还原下载原文件。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-amber-700">提示</span>：Base64 是<span class="font-medium text-blue-800">编码</span
			>而非加密，转换在浏览器本地完成，文件不会上传到服务器。
		</p>
	</div>
</template>
