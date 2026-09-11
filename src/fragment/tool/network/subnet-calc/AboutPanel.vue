<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是子网划分？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			子网划分（Subnetting）将一个较大的网络按更长的前缀切成多个更小的子网。给定一个
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">网络/CIDR</code>
			与目标前缀长度，子网数量为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">2^(目标前缀 - 原前缀)</code>。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			例如把 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.0/24</code> 划分为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/26</code> 的 4 个子网：
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.0/26</code>、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.64/26</code>、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.128/26</code>、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.192/26</code>，每个子网有 64 个地址。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			IPv4 每个子网的网络地址与广播地址不能分配给主机，因此
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/26</code>
			子网可用主机数为 62；<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/31</code> 常用于点对点链路（2
			个地址均可用），<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/32</code>
			为单个主机。IPv6 没有广播地址概念，所有地址均可用于接口，通常以
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/64</code> 为一个标准子网。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			当子网数量过多时（超过 500 个），本工具仅展示前 500 条，避免页面卡顿；每个子网行均可点击复制其网络地址（CIDR）。
		</p>
	</div>
</template>
