<template>
	<!-- AboutPanel：RAID 存储计算器简介，说明容量 / 冗余 / 性能三者权衡与热备的作用 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3">
		<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
			<h3 class="text-sm font-semibold text-blue-800">什么是 RAID？怎么算可用容量？</h3>
			<code class="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[11px] text-blue-700">
				可用容量 =（阵列磁盘数 − 冗余盘数）× 单盘容量
			</code>
		</div>
		<p class="mt-1.5 text-xs leading-relaxed text-slate-600">
			RAID 用「冗余」换可靠性、用「条带」换性能，各等级的差别就是
			<strong class="text-slate-700">容量、容错、性能</strong>
			三者的取舍：镜像类（RAID 1 / 10）利用率固定 50% 但重建最快，校验类（RAID 5 / 6）利用率高但存在写惩罚，条带类（RAID
			0 / JBOD）容量全可用却无任何冗余。例如 7 块 4 TB 组 RAID 5：冗余 1 块，可用 24 TB（十进制），系统显示为 21.82 TiB
			—— 厂商按 10¹² 计、系统按 2⁴⁰ 计。
		</p>
		<p class="mt-1.5 text-xs leading-relaxed text-slate-600">
			<strong class="text-slate-700">热备盘</strong>（Hot Spare）是待命但不参与读写的磁盘，坏盘后自动顶替并重建：<strong
				class="text-slate-700"
				>全局热备</strong
			>可服务同一控制器下的多个阵列，<strong class="text-slate-700">专用热备</strong
			>只服务当前阵列。它占用盘位与总物理容量，但<strong class="text-slate-700">不计入阵列可用容量</strong
			>；重建期间阵列处于无冗余的降级状态，热备不能替代备份。
		</p>
	</div>
</template>
