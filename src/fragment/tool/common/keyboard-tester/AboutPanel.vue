<template>
	<!-- 关于键盘测试 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">键盘测试怎么用？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			页面会渲染一套完整键盘模型，<strong class="text-blue-800">直接敲击物理键盘</strong>即可：按下的键实时高亮，
			松开后保留浅色标记，方便逐个排查失灵或连击的按键。所有按键都支持
			<span class="font-medium text-blue-800">组合键测试</span>（如 Ctrl + Shift + A、⌘ + Space），
			键盘模型会同时高亮组合中的全部按键。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			右侧面板展示每个按键的常用信息：<code class="rounded bg-white/60 px-1 font-mono text-blue-700">event.key</code>
			（字符值）、<code class="rounded bg-white/60 px-1 font-mono text-blue-700">event.code</code>（物理键位）、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">keyCode</code>（旧版兼容值）与所属键区， 并实时统计
			<strong class="text-blue-800">APM</strong>（每分钟按键数）与按键峰值、记录输入历史。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			顶部可切换 <strong class="text-blue-800">Windows / macOS</strong> 布局差异（修饰键与回车键标注不同），
			默认按当前系统自动选中；测试仅在浏览器本地进行，不会上传任何数据。
		</p>
	</div>
</template>
