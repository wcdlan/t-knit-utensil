<template>
	<!-- AboutPanel：工具简介，仅在解析页签展示，完整的语法速查见「Cron 表达式介绍」页签 -->
	<div class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
		<h3 class="mb-3 text-sm font-semibold text-blue-800">什么是 Cron 表达式？</h3>
		<p class="mb-2 text-sm leading-relaxed text-slate-600">
			Cron 表达式是一串用空格分隔的字段，用来描述「什么时候执行」。Linux crontab、Quartz、Spring
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">@Scheduled</code>
			、Kubernetes CronJob、各类定时任务平台都使用它。本工具在浏览器本地完成解析与预览，表达式不会上传。
		</p>
		<p class="text-sm leading-relaxed text-slate-600">
			支持 5 段标准式、6 段带秒式、7 段带年式，以及
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">@daily</code>
			等别名与
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">@every 30m</code>
			间隔写法；同时兼容 Quartz 的
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">?</code>
			、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">L</code>
			、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">W</code>
			、
			<code class="rounded bg-white/60 px-1 font-mono text-blue-700">#</code>
			等扩展语法。字段结构、特殊字符含义与常见易错点见「Cron 表达式介绍」页签。
		</p>
	</div>
</template>
