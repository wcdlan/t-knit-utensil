<script lang="ts" setup>
	import { icons } from '@/data/icons';
	import TkuIcon from '@/component/common/TkuIcon.vue';
</script>

<template>
	<!-- 未找到状态：工具地址无效时展示 -->
	<div class="flex flex-col items-center justify-center py-24 text-center">
		<div class="mb-4 text-slate-300">
			<TkuIcon :name="icons.magnify" :size="48" />
		</div>
		<p class="text-slate-500 text-lg font-medium mb-2">工具未找到</p>
		<p class="text-slate-400 text-sm mb-6">请检查工具地址是否正确</p>
		<router-link
			class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium no-underline"
			to="/"
		>
			<span>&larr;</span> 返回首页
		</router-link>
	</div>
</template>
