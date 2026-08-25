<script lang="ts" setup>
	import { NCard } from 'naive-ui';
</script>

<template>
	<!-- 系统信息卡片：存储方式与生效说明（静态说明） -->
	<n-card size="small" title="系统信息">
		<div class="text-xs text-slate-500 leading-relaxed">
			<p>运行时数据：<code class="bg-slate-100 px-1 rounded">site.db</code> 存储在服务器端（SQLite）。</p>
			<p>默认配置：<code class="bg-slate-100 px-1 rounded">site.config.json</code> 仅作初始默认值。</p>
			<p>配置修改后立即持久化，刷新页面即生效。</p>
		</div>
	</n-card>
</template>
