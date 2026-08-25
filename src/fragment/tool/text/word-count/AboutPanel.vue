<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于字数统计</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			「总字符数」统计所有字符（包括空格与换行），而「无空格字符数」排除空白字符，反映实际文本量。
			「单词数」按空白分隔统计，适用于英文等以空格分词的文本，中文文本建议关注字符数与段落数。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			「中文字符」统计汉语常用汉字（Unicode 区块
			<code class="font-mono text-xs text-blue-800">U+4E00–U+9FFF</code>），
			不含标点、数字与字母；「数字组数」统计连续数字片段的数量。 「字节数」显示文本按 UTF-8
			编码后的字节大小——中文字符每个约占 3 字节，英文字符和数字各占 1 字节。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			常见应用场景：撰写文章时控制篇幅长度、准备社交媒体内容（如 Twitter 的 280 字符限制）、
			评估代码注释与文档的翻译工作量、以及按字数计费的翻译或写作任务。所有统计纯前端实时计算，内容不会上传。
		</p>
	</div>
</template>
