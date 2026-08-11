import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const TOKEN_KEY = 'tku-auth-token';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', component: Home },
		{
			path: '/tool/:toolId',
			component: () => import('@/views/ToolPage.vue')
		},
		{
			path: '/login',
			component: () => import('@/views/Login.vue')
		},
		{
			path: '/settings',
			component: () => import('@/views/Settings.vue')
		}
	]
});

router.beforeEach((to) => {
	if (to.path === '/settings') {
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) return '/login';
	}
});

export default router;
