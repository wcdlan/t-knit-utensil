<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
</script>

<template>
	<!-- 品牌区：Logo 徽标 + 标题 + 副标题 -->
	<div class="text-center mb-8">
		<div
			class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20"
		>
			<span class="text-white">
				<TkuIcon :name="icons.lock" :size="28" />
			</span>
		</div>
		<h1 class="text-2xl font-bold text-slate-800 mb-1 tracking-tight">TKU 设置</h1>
		<p class="text-sm text-slate-500">请输入密码以访问站点设置</p>
	</div>
</template>
