import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const TOKEN_KEY = 'tku-auth-token';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', component: Home },
		{
			path: '/tool',
			component: () => import('@/views/ToolPage.vue'),
			children: [
				{ path: 'base64', component: () => import('@/components/tools/codec/Base64Tool.vue') },
				{ path: 'url-encode', component: () => import('@/components/tools/codec/UrlEncode.vue') },
				{ path: 'unicode', component: () => import('@/components/tools/codec/UnicodeTool.vue') },
				{ path: 'encoding', component: () => import('@/components/tools/codec/EncodingTool.vue') },
				{ path: 'json-formatter', component: () => import('@/components/tools/formatter/JsonFormatter.vue') },
				{ path: 'sql-formatter', component: () => import('@/components/tools/formatter/SqlFormatter.vue') },
				{ path: 'timestamp', component: () => import('@/components/tools/converter/TimestampTool.vue') },
				{ path: 'color', component: () => import('@/components/tools/converter/ColorConverter.vue') },
				{ path: 'uuid', component: () => import('@/components/tools/generator/UuidGenerator.vue') },
				{ path: 'hash', component: () => import('@/components/tools/generator/HashTool.vue') },
				{ path: 'qrcode', component: () => import('@/components/tools/generator/QrcodeTool.vue') },
				{ path: 'password', component: () => import('@/components/tools/generator/PasswordTool.vue') },
				{ path: 'regex', component: () => import('@/components/tools/text/RegexTool.vue') },
				{ path: 'diff', component: () => import('@/components/tools/text/DiffTool.vue') },
				{ path: 'word-count', component: () => import('@/components/tools/text/WordCount.vue') },
				{ path: 'ssh-keygen', component: () => import('@/components/tools/ssh/SshKeyGen.vue') },
				{ path: 'favicon', component: () => import('@/components/tools/image/FaviconTool.vue') },
				{ path: 'ai-tester', component: () => import('@/components/tools/ai/AiApiTester.vue') },
				{ path: 'license-selector', component: () => import('@/components/tools/common/LicenseSelector.vue') }
			]
		},
		{
			path: '/login',
			component: () => import('@/views/Login.vue')
		},
		{
			path: '/admin/config',
			component: () => import('@/views/Settings.vue')
		}
	]
});

router.beforeEach((to) => {
	if (to.path === '/admin/config') {
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) return '/login';
	}
});

export default router;
