<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 IPv6？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			IPv6 地址由 128 位二进制数组成，以 8 组十六进制表示，组间用冒号分隔，例如
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">2001:0db8:85a3:0000:0000:8a2e:0370:7334</code>。
			组内前导零可省略，连续的全零组可压缩为
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">::</code>
			（如 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">2001:db8::1</code>）。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			IPv6 无需子网掩码，直接使用 CIDR 前缀长度（0-128）表示子网，例如
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">2001:db8::/32</code>。 后 64
			位通常作为接口标识符（EUI-64 / 随机生成），与网络前缀共同构成单播地址。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			常见特殊地址：
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">::</code>
			为未指定地址，
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">::1</code>
			为环回地址，
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">fe80::/10</code>
			为链路本地地址，
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">fc00::/7</code>
			为唯一本地地址，
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">ff00::/8</code>
			为组播地址。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">::ffff:a.b.c.d</code>
			形式的地址是 IPv4 映射地址，用于在 IPv6 网络中表示 IPv4 地址（如
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">::ffff:192.168.1.1</code>）。
		</p>
	</div>
</template>
