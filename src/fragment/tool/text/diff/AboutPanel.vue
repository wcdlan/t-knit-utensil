<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">关于文本对比</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			文本对比工具通过<span class="font-medium text-blue-800">最长公共子序列（LCS）</span>算法，
			计算两段文本逐行的差异——绿色标记新增行，红色标记删除行，白色为未变行。这是 Git
			等版本控制系统中最核心的差异比较算法。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			常见应用场景：对比代码修改前后的差异、校验配置文件版本变更、检查翻译文本是否完整、以及审查文档的增删改动。
			本工具纯前端计算，文本内容不会上传至任何服务器。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			需要注意的是：本工具采用<span class="font-medium text-blue-800">行级</span>对比（按换行符拆分），
			适合结构化文本（代码、配置文件等）。对于纯段落级的长文本，建议先按行整理再进行比较。
		</p>
	</div>
</template>
