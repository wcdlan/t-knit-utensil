<template>
	<!-- About JSON -->
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex-shrink-0">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 JSON？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			JSON（JavaScript Object
			Notation）是一种轻量级的数据交换格式，以「键值对」组织数据，支持对象、数组、字符串、数字、布尔值和
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">null</code>
			共 6 种数据类型。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			压缩格式将多余的空格和换行去掉，只保留结构所需的字符，体积更小，常用于接口日志、存储与传输；格式化则缩进换行、层次分明，便于阅读与调试。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			「校验」仅检查语法是否合法：合法的 JSON 必须是
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{...}</code>
			或
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">[...]</code>
			开头，字符串用双引号包裹，且不能有尾随逗号。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			常见应用场景：调试前后端接口返回、解析配置文件、处理 API 请求体、以及将数据库查询结果转成 JSON 供程序使用。
		</p>
	</div>
</template>
