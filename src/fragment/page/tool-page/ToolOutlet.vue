<template>
	<!-- 嵌套路由出口：渲染当前工具子路由的页面组件（带过渡与缓存） -->
	<router-view v-slot="{ Component }">
		<transition mode="out-in" name="tool">
			<keep-alive>
				<component :is="Component" class="flex-1 min-h-0" />
			</keep-alive>
		</transition>
	</router-view>
</template>
