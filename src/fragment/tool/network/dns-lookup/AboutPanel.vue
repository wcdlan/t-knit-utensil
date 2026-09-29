<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">网络解析与可达性检测</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			本工具在部署服务器上执行真实的 DNS 查询与网络探测，浏览器只负责展示结果。解析可选择
			<strong class="text-blue-800">系统默认 DNS</strong>（服务器自身的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/etc/resolv.conf</code> 配置），也可
			<strong class="text-blue-800">指定任意 DNS 服务器</strong>（支持
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">IP:端口</code>，可用于内网 DNS 或自建
			DNS），两者都走标准 UDP/TCP 53 查询。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<strong class="text-blue-800">支持的记录类型：</strong>A（域名 →
			IPv4）、CNAME（别名）、MX（邮件交换，含优先级）、NS（权威服务器）、TXT（SPF / DKIM / 域名验证等文本）、PTR（IP →
			域名反向解析）。切换页签即可分别查询。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<strong class="text-blue-800">PING 检测：</strong>ICMP 方式调用服务器上的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">ping</code>
			命令；若服务器未安装 ping（如精简容器），可改用 TCP
			方式对指定端口发起连接探测——连接成功表示端口开放，返回“端口未开放”也表示主机可达，仅超时才是不可达。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			注意：解析结果反映的是<strong class="text-blue-800">部署服务器所处网络</strong
			>的视角，可能与你的本地网络（含运营商缓存、DNS 劫持、CDN 调度）存在差异；指定 DNS
			能帮助你对比不同解析源的返回结果。
		</p>
	</div>
</template>
