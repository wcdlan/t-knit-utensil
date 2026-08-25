<template>
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">关于 SSH 密钥</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			SSH 密钥对由<span class="font-medium text-blue-800">公钥</span>（可公开分发）和<span
				class="font-medium text-blue-800"
				>私钥</span
			>（必须保密）组成。 使用时将公钥部署到服务器（<code class="font-mono text-xs text-blue-800"
				>~/.ssh/authorized_keys</code
			>）， 客户端用私钥签名验证身份——无需输入密码，比传统口令认证更安全便捷。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			<span class="font-medium text-blue-800">RSA</span> 是最广泛兼容的算法，推荐 3072 或 4096 位；
			<span class="font-medium text-blue-800">ECDSA</span>（椭圆曲线）密钥更短但安全性相当， P-256（256 位）、P-384（384
			位）、P-521（521 位）三个等级可选。请注意：ECDSA 依赖系统 OpenSSL 实现， 部分旧系统可能不支持。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			可以为私钥设置<span class="font-medium text-blue-800">密码短语（passphrase）</span>作为额外保护层——
			即使私钥文件泄露，攻击者仍需密码才能使用。本工具在服务器端调用系统
			<code class="font-mono text-xs text-blue-800">ssh-keygen</code>
			生成密钥，私钥生成后不会持久化存储。
		</p>
	</div>
</template>
