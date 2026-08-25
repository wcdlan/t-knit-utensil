<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
</script>

<template>
	<!-- 系统管理组：固定入口，不参与搜索与折叠 -->
	<div class="mb-6">
		<div class="mb-4 flex items-center gap-2.5">
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 ring-1 ring-inset ring-blue-100"
			>
				<TkuIcon :name="icons.cog" :size="16" />
			</span>
			<span class="text-sm font-bold tracking-wide text-slate-700">系统管理</span>
			<span
				class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/80"
			>
				1
			</span>
			<span class="ml-1 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></span>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
			<router-link
				class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/card"
				title="配置站点信息、页脚内容与登录密码"
				to="/admin/config"
			>
				<span class="text-slate-500 transition-transform duration-200 group-hover/card:scale-110">
					<TkuIcon :name="icons.cog" :size="24" />
				</span>
				<span class="text-sm font-medium text-slate-700 text-center leading-tight">系统配置</span>
			</router-link>
		</div>
	</div>
</template>
