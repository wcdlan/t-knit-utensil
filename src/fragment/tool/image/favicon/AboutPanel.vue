<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于 Favicon</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			Favicon（收藏夹图标）是显示在浏览器标签页、书签栏和地址栏左侧的小图标，通常为 16×16 或 32×32 像素。 一个设计良好的
			favicon 能显著提升网站的品牌辨识度，让用户在众多标签页中快速定位你的站点。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">PNG</span>
			格式支持透明背景，被现代浏览器广泛支持，推荐作为首选格式；
			<span class="font-medium text-blue-800">ICO</span> 格式是传统格式，兼容旧版浏览器（如
			IE），可在一个文件中包含多个尺寸。 HTML 中通过
			<code class="font-mono text-xs text-blue-800">&lt;link rel="icon"&gt;</code> 标签引入。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			为了适配不同场景，通常需要生成多个尺寸：16×16（标签页）、32×32（任务栏/快捷键）、 48×48（书签列表）、以及
			180×180（苹果设备）、192×512（PWA 图标）等。本工具一键生成多尺寸多格式， 并支持 ZIP 打包下载，方便直接部署。
		</p>
	</div>
</template>
