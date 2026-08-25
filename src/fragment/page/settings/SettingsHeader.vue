<script lang="ts" setup>
	const emit = defineEmits<{
		logout: [];
	}>();
</script>

<template>
	<!-- 设置页头部：面包屑与退出 + 标题区 -->
	<div>
		<!-- 面包屑与退出 -->
		<div class="mb-6 flex items-center justify-between">
			<router-link
				class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-500 transition-colors duration-200"
				to="/"
			>
				<span class="text-base">&larr;</span> 返回首页
			</router-link>
			<button
				class="text-sm text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
				@click="emit('logout')"
			>
				退出登录
			</button>
		</div>

		<!-- 标题区 -->
		<div class="mb-8">
			<h1 class="text-2xl font-bold text-slate-800 tracking-tight">系统配置</h1>
			<p class="text-slate-500 text-sm mt-1">按分组配置站点信息、页脚内容与登录密码，保存后立即生效</p>
		</div>
	</div>
</template>
