<script lang="ts" setup>
	defineProps<{
		now: number;
		nowMs: number;
	}>();
</script>

<template>
	<div class="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
		<h3 class="text-sm font-semibold text-blue-800 mb-3">什么是时间戳？</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-3">
			时间戳（Unix 时间戳）是从
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">1970-01-01 00:00:00 UTC</code>
			起经过的秒数或毫秒数。它用一个整数记录时刻，与时区无关，因此在数据传输、存储与对比时不会因时区不同而产生歧义。
		</p>
		<div class="text-sm text-slate-600 leading-relaxed mb-3">
			<p class="mb-1">根据精度的不同，时间戳分为两种：</p>
			<ul class="list-disc pl-5 space-y-1">
				<li>
					<span class="font-medium">秒级时间戳</span>（10 位数字，如
					<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{{ now }}</code
					>）：单位是秒，最常见的格式。
				</li>
				<li>
					<span class="font-medium">毫秒级时间戳</span>（13 位数字，如
					<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">{{ nowMs }}</code
					>）：单位是毫秒，精度更高，常见于 JavaScript、Java 等语言中的默认值。
				</li>
			</ul>
		</div>
		<p class="text-sm text-slate-600 leading-relaxed mb-3">
			判断技巧：数一下位数即可，<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">10 位</code>是秒级，
			<code class="font-mono text-blue-700 bg-white/60 px-1 rounded">13 位</code>是毫秒级。本工具的 「时间戳 →
			日期」会自动识别并转换。
		</p>
		<p class="text-sm text-slate-600 leading-relaxed">
			常见应用场景：数据库与日志中记录时间、API 接口传参、Session / Token 过期校验、以及缓存过期时间设置等。顶部
			「当前时间」区域每秒实时刷新，可直接复制使用。
		</p>
	</div>
</template>
