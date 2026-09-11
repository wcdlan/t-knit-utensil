<template>
	<!-- 关于浏览器信息 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">这里能看到什么？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具通过浏览器公开的标准 API（<code class="rounded bg-white/60 px-1 font-mono text-blue-700">navigator</code> /
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">screen</code> /
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">performance</code> 等）读取当前环境信息，涵盖
			<strong class="text-blue-800"
				>浏览器与渲染引擎、操作系统与硬件、屏幕与视口、网络与公网 IP、存储配额、电池状态、性能与内存</strong
			>， 以及 50 余项 Web 能力支持检测。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			这些信息常用于排查「为什么这个网站在我的浏览器上表现不同」——例如确认浏览器版本、核对设备像素比、检查是否支持 WebGL
			/ WebAssembly 等特性、比对公网 IP 与运营商、定位缓存或存储配额问题。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-amber-700">隐私提示</span>：除「公网
			IP」一项经本站服务端转发查询外，其余数据全部在浏览器本地读取、不会上传；公网 IP
			也可通过站点反向代理暴露给第三方接口，如介意请勿点击刷新。
		</p>
	</div>
</template>
