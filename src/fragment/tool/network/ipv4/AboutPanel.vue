<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 IPv4 与 CIDR？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			IPv4 地址由 32 位二进制数组成，通常以
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">a.b.c.d</code>
			形式的点分十进制表示，每位取值 0-255。CIDR（无类别域间路由）通过在地址后追加
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/前缀长度</code>
			（如 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.1.0/24</code>）表示子网范围。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			前缀长度表示子网掩码中连续的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">1</code>
			的位数，例如 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">/24</code> 对应掩码
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">255.255.255.0</code>，每个子网共
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">256</code>
			个地址，其中首尾两个分别保留为网络地址与广播地址。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			地址按首字节划分为 A-E 五类；其中
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">10.0.0.0/8</code>、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">172.16.0.0/12</code>、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">192.168.0.0/16</code>
			为私有地址，<code class="rounded bg-white/60 px-1 font-mono text-blue-700">127.0.0.0/8</code>
			为环回地址（本机回环）。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			注意：<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/31</code>
			常用于点对点链路（无需网络与广播地址），<code class="rounded bg-white/60 px-1 font-mono text-blue-700">/32</code>
			表示单个主机地址。
		</p>
	</div>
</template>
