<template>
	<!-- 关于时间日期转换器 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">怎么用？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			把任意写法的日期时间粘贴进来，工具会<strong class="text-blue-800">自动识别格式</strong>并换算为 Unix 时间戳、ISO
			8601、RFC 2822、HTTP 日期、中文格式等 20 种常见表示，点击任意结果即可复制。
		</p>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			若输入<strong class="text-blue-800">不带时区</strong>，将按所选「输入时区」解释；若自带
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">Z</code> /
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">+08:00</code> 等标记，则以输入自带的时区为准。
			右侧「目标时区」决定输出展示的时区，两者可独立选择、一键互换。
		</p>
	</div>
</template>
