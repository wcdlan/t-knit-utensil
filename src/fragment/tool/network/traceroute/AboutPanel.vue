<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">路由追踪（traceroute / tracert）</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			数据包在 IP 网络中逐跳转发，每经过一个路由器
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">TTL</code>
			就减 1，减到 0 时该路由器会回送一条
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">ICMP 超时</code>
			报文。路由追踪就是从 TTL=1 开始逐次递增，记录每一跳回送报文的来源地址与往返延迟，最终画出到目标的完整路径。它比
			PING 更能回答“卡在哪一跳”“是否绕路”“路由是否对称”这类问题。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<strong class="text-blue-800">结果怎么看：</strong>
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">*</code>
			表示该跳在超时时间内没有应答（很多骨干路由器限速甚至不回应 ICMP，中段出现若干
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">*</code>
			但后续跳有响应属正常现象）；同一跳出现多个 IP，说明中间存在负载均衡或等价多路径；标注
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">!H / !N / !X</code>
			分别表示主机不可达 / 网络不可达 / 被策略禁止；延迟突然抬升的那一跳，通常是链路拥塞或跨网出口。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<strong class="text-blue-800">探测方式与限制：</strong>本工具在部署服务器上调用系统命令（Linux / macOS 为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">traceroute</code>，Windows 为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">tracert</code>），Unix 平台默认使用 UDP
			高端口探测，Windows 使用 ICMP；命令需要原始套接字权限（容器需具备
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">NET_RAW</code>
			能力或 root）。另外，路由器对 ICMP 的处理优先级较低，跃点延迟只能作为参考，不等于业务端到端延迟。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			追踪结果反映的是<strong class="text-blue-800">部署服务器</strong
			>的出口路径，与你的本地网络路径可能完全不同；若要排查本地到目标的路径，请在本地执行同样的追踪命令进行对比。
		</p>
	</div>
</template>
