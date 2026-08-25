<template>
	<!-- 嵌套路由出口：渲染当前工具子路由的页面组件。
	     使用 transition mode="out-in" 做进出动画，但必须给动态组件加 :key="route.path"
	     （否则 Vue 无法区分新旧组件，out-in 模式会卡住导致新组件不挂载 → 空白页）。
	     不使用 keep-alive：每次切换重新挂载，工具状态不跨页保留 -->
	<router-view v-slot="{ Component, route }">
		<transition mode="out-in" name="tool">
			<component :is="Component" :key="route.path" class="flex-1 min-h-0" />
		</transition>
	</router-view>
</template>
