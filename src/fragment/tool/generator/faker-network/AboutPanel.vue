<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于「网络与设备生成」</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具批量生成网络相关仿真数据：域名、邮箱、IPv4/IPv6 地址、MAC 地址、端口、HTTP 状态码与浏览器 UA。 IPv4
			从完整地址空间随机抽取（可后续扩展为指定网段），MAC 地址使用冒号分隔的标准格式。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			HTTP 状态码覆盖 1xx~5xx 各类别（200、404、500 等），可用于接口日志模拟；浏览器 UA 随机组合操作系统、内核与版本号，
			例如 Chrome / Firefox / Safari / Edge，适合做流量分析与设备指纹演示。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">典型场景</span
			>：网络日志脱敏演示、访问日志测试、防火墙规则调试、以及需要随机 IP/UA 的爬虫与安全工具开发。所有 IP
			均为随机生成，不代表真实设备。
		</p>
	</div>
</template>
