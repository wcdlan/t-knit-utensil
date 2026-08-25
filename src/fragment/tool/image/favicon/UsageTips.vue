<script lang="ts" setup>
	import { NAlert } from 'naive-ui';
</script>

<template>
	<n-alert class="text-sm" type="warning">
		<template #header>
			<span class="font-medium">使用提示</span>
		</template>
		<ul class="space-y-1 text-amber-700">
			<li>• 推荐上传至少 260×260 的图片，以确保所有尺寸清晰</li>
			<li>• PNG 格式支持透明背景，是现代浏览器推荐格式</li>
			<li>• ICO 格式兼容旧版浏览器，可单独或与 PNG 同时选中</li>
			<li>• 打包下载仅包含选中的尺寸与格式</li>
		</ul>
	</n-alert>
</template>
