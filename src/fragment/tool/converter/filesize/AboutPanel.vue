<template>
	<!-- AboutPanel：容量单位由来、1000 与 1024 两套标准的差别及「硬盘缩水」原因 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3">
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<h3 class="text-sm font-semibold text-blue-800">KB 和 KiB 有什么区别？</h3>
			<code class="rounded bg-white/60 px-1.5 py-0.5 font-mono text-xs text-blue-700">
				1 KB = 1000 B　　1 KiB = 1024 B
			</code>
		</div>
		<div class="mt-1.5 grid gap-x-6 gap-y-1.5 text-[13px] leading-relaxed text-slate-600 xl:grid-cols-2">
			<p>
				<strong class="text-slate-700">十进制（SI，1000 进制）</strong>：KB、MB、GB、TB 之间按 10³
				递进，是国际单位制写法，硬盘 / U 盘 / 网络带宽厂商普遍采用。
				<strong class="text-slate-700">二进制（IEC，1024 进制）</strong>：KiB、MiB、GiB、TiB 之间按 2¹⁰ = 1024
				递进，是计算机内部的真实进位方式，操作系统（Windows 的资源管理器、Linux 的 df
				等）多用这套。本工具同时给出两套结果，便于对照。
			</p>
			<p>
				正因为两套标准混用，才会出现「<strong class="text-slate-700">硬盘缩水</strong>」的错觉：厂商标称 1 TB 即 10¹²
				字节，而系统按 2⁴⁰ 显示，结果为 931.32 GiB，约为标称值的 93.13%（标称 128 GB ≈ 系统 119.21
				GB，比例相同）。所以买来的 512 GB 硬盘在系统里只看到约 476 GiB，并不是容量缺失。
			</p>
			<p>
				换算时先把输入统一折算为<strong class="text-slate-700">比特（bit）</strong>再换算到目标单位：1 字节 = 8
				比特，因此 <code class="font-mono text-blue-700">1 MiB = 1024 KiB = 1048576 B = 8388608 bit</code>。网络带宽常用
				<strong class="text-slate-700">Mbps / Gbps</strong>（比特每秒），与下载速度的
				<strong class="text-slate-700">MB/s</strong> 相差 8 倍：100 Mbps 的线路理论下载速度约 12.5 MB/s。
			</p>
		</div>
	</div>
</template>
