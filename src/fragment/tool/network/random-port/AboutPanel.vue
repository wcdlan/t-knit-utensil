<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">端口号与随机端口生成</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			同一台主机上的服务靠 <code class="rounded bg-white/60 px-1 font-mono text-blue-700">IP + 端口</code>
			共同定位，端口号是 16 位无符号整数，取值范围
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">0-65535</code>。IANA 把它划分为三段：系统端口
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">1-1023</code>（知名服务，监听需 root /
			管理员权限）、注册端口
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">1024-49151</code>（各服务在此注册默认端口）、动态 /
			私有端口
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">49152-65535</code>（操作系统临时端口也取自此处）。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			开发、测试或部署临时服务时，常常需要挑一个“看起来没人用”的端口。本工具会在指定区间内生成互不重复的随机端口，并可排除
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">1-1023</code>
			的系统端口与下方速查表中的常用服务端口，减少与其他服务撞车的概率。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<strong class="text-blue-800">注意：</strong
			>随机结果只代表该端口在常用服务列表中“未被占用”，并不能反映主机上的真实占用情况。正式使用前仍建议在目标机器上确认，例如
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">ss -lntup | grep :端口号</code>、<code
				class="rounded bg-white/60 px-1 font-mono text-blue-700"
				>lsof -i :端口号</code
			>
			或 Windows 上的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">netstat -ano | findstr :端口号</code>。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			把随机端口当作安全手段并不可靠——端口扫描器会遍历全部 65535 个端口。真正的防护依赖认证、访问控制与防火墙策略。
		</p>
	</div>
</template>
