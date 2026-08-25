<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是 UUID？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-3">
			UUID（通用唯一标识符）是 128 位的标识符，通常以
			<code class="font-mono text-xs text-blue-800">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
			形式呈现，用于在分布式系统中唯一标识实体。不同版本采用不同的生成策略：
		</p>
		<ul class="text-sm text-slate-600 leading-relaxed space-y-1.5 list-inside">
			<li>
				<span class="font-medium text-blue-800">v1</span>：基于时间戳与节点标识（MAC
				地址或随机）生成，可排序但可能泄露机器信息。
			</li>
			<li>
				<span class="font-medium text-blue-800">v3</span>：对名称与命名空间做 MD5 哈希，结果确定（相同输入必得相同
				UUID）。
			</li>
			<li><span class="font-medium text-blue-800">v4</span>：纯随机生成（加密安全），最常见的版本。</li>
			<li><span class="font-medium text-blue-800">v5</span>：与 v3 类似，但改用 SHA-1 哈希，碰撞概率更低。</li>
			<li><span class="font-medium text-blue-800">v6</span>：时间有序前缀的 v1 改进版，既保留时间信息又便于排序。</li>
			<li><span class="font-medium text-blue-800">v7</span>：Unix 时间戳 + 随机值，直观可排序，新应用推荐使用。</li>
		</ul>
		<p class="text-sm text-slate-600 leading-relaxed mt-3">
			历史上的 <span class="font-medium text-blue-800">v2</span>（DCE Security）依赖宿主机 POSIX
			UID/GID，在浏览器端无法有意义地生成，已不推荐使用，故本工具未提供。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed mt-2">
			请注意：UUID 保证的是唯一性，而非密码学安全，不应作为认证 token
			或密钥使用。所有生成均在浏览器本地完成，内容不会上传。
		</p>
	</div>
</template>
