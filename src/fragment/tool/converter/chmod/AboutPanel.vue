<template>
	<!-- AboutPanel：chmod 权限含义、数字来历与特殊位说明（宽屏双栏，避免长行影响阅读） -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3">
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<h3 class="text-sm font-semibold text-blue-800">Linux 文件权限怎么读？</h3>
			<code class="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs text-blue-700">
				r = 4　w = 2　x = 1　数字 = 三者相加
			</code>
		</div>
		<div class="mt-1.5 grid gap-x-6 gap-y-1.5 text-[13px] leading-relaxed text-slate-600 xl:grid-cols-2">
			<p>
				权限由三位八进制数字组成，依次表示<strong class="text-slate-700">所有者（u）</strong>、<strong
					class="text-slate-700"
					>所属组（g）</strong
				>、<strong class="text-slate-700">其他用户（o）</strong>。每位数字是 r(4)、w(2)、x(1) 的和，例如
				<code class="rounded bg-white/60 px-1 font-mono text-blue-700">755</code> = 所有者
				<code class="font-mono">rwx</code>（4+2+1）、组与其他用户 <code class="font-mono">r-x</code>（4+1）。
			</p>
			<p>
				对应的符号表示为
				<code class="rounded bg-white/60 px-1 font-mono text-blue-700">rwxr-xr-x</code>，再加上类型位就是
				<code class="font-mono">-rwxr-xr-x</code>。符号表示里 setuid / setgid 显示为
				<code class="font-mono">s</code>、sticky 显示为 <code class="font-mono">t</code>；若写成大写
				<code class="font-mono">S / T</code>，说明该位已设置但对应的执行权限并未开启。
			</p>
			<p>
				第四位数字是<strong class="text-slate-700">特殊权限位</strong>：<code class="font-mono text-blue-700">4</code>
				为 setuid（执行时以所有者身份运行）、<code class="font-mono text-blue-700">2</code> 为
				setgid（目录内新建文件继承所属组）、<code class="font-mono text-blue-700">1</code> 为
				sticky（目录内仅属主可删除自己的文件，如 <code class="font-mono">/tmp</code> 的
				<code class="font-mono">1777</code>）。
			</p>
			<p>
				目录的权限含义与文件不同：<code class="font-mono">r</code> 表示能否列出目录内容，<code class="font-mono"
					>w</code
				>
				表示能否在目录内新建 / 删除文件，<code class="font-mono">x</code> 表示能否进入目录（cd）。修改权限用
				<code class="rounded bg-white/60 px-1 font-mono text-blue-700">chmod 755 文件</code>，目录及其内容一起修改则加
				<code class="font-mono">-R</code>。
			</p>
		</div>
	</div>
</template>
