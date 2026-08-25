<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「文本内容生成」</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具按所选语言区域生成占位文本，支持单词、句子、段落与短横线形式（slug）四种粒度。中文区域基于《千字文》风格的词典生成中文占位文案，
			英文区域则为经典 Lorem Ipsum 拉丁文占位文本。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			占位文本常用于页面原型、排版预览与富文本测试：段落适合填充文章正文，句子适合列表摘要，单词适合标签或按钮文案，
			slug 形式则适合生成 URL 路径或文件名的雏形。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">小技巧</span
			>：切换语言后文本会自动重新生成，可以快速对比不同语言下的排版宽度，帮助评估 多语言站点是否存在文字溢出问题。
		</p>
	</div>
</template>
