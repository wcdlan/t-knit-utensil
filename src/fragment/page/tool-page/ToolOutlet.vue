<template>
	<!-- 嵌套路由出口：渲染当前工具子路由的页面组件（keep-alive 缓存，无 transition——mode="out-in" 连续切换会导致新组件不挂载空白） -->
	<router-view v-slot="{ Component }">
		<keep-alive>
			<component :is="Component" class="flex-1 min-h-0" />
		</keep-alive>
	</router-view>
</template>
