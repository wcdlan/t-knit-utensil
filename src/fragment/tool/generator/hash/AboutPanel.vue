<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是哈希？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			哈希算法将任意长度的输入映射为固定长度的十六进制摘要（MD5 为 32 位、SHA-256 为 64
			位）。只要输入稍有不同，输出就会面目全非，且过程不可逆。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mb-2">
			MD5 与 SHA-1 存在已知碰撞漏洞，不再适合安全场景；SHA-256/384/512 （属于 SHA-2
			家族）至今仍被广泛用于文件校验与数据处理。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			常见应用场景：校验下载文件完整性（对比哈希值）、判断两段内容是否一致、以及为密码存储加盐。本工具在浏览器端本地计算，内容不会上传——但请注意，只有哈希是<span
				class="font-medium text-blue-800"
				>不可逆的指纹</span
			>，请勿用它加密敏感信息。
		</p>
	</div>
</template>
