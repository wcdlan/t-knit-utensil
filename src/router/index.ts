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
				{ path: 'base64', component: () => import('@/component/tools/codec/Base64Tool.vue') },
				{ path: 'url-encode', component: () => import('@/component/tools/codec/UrlEncode.vue') },
				{ path: 'unicode', component: () => import('@/component/tools/codec/UnicodeTool.vue') },
				{ path: 'encoding', component: () => import('@/component/tools/codec/EncodingTool.vue') },
				{ path: 'json-formatter', component: () => import('@/component/tools/formatter/JsonFormatter.vue') },
				{ path: 'sql-formatter', component: () => import('@/component/tools/formatter/SqlFormatter.vue') },
				{ path: 'timestamp', component: () => import('@/component/tools/converter/TimestampTool.vue') },
				{ path: 'color', component: () => import('@/component/tools/converter/ColorConverter.vue') },
				{ path: 'uuid', component: () => import('@/component/tools/generator/UuidGenerator.vue') },
				{ path: 'hash', component: () => import('@/component/tools/generator/HashTool.vue') },
				{ path: 'qrcode', component: () => import('@/component/tools/generator/QrcodeTool.vue') },
				{ path: 'password', component: () => import('@/component/tools/generator/PasswordTool.vue') },
				{ path: 'faker-identity', component: () => import('@/component/tools/generator/FakerIdentityTool.vue') },
				{ path: 'faker-address', component: () => import('@/component/tools/generator/FakerAddressTool.vue') },
				{ path: 'faker-company', component: () => import('@/component/tools/generator/FakerCompanyTool.vue') },
				{ path: 'faker-network', component: () => import('@/component/tools/generator/FakerNetworkTool.vue') },
				{ path: 'faker-text', component: () => import('@/component/tools/generator/FakerTextTool.vue') },
				{ path: 'faker-finance', component: () => import('@/component/tools/generator/FakerFinanceTool.vue') },
				{ path: 'faker-nature', component: () => import('@/component/tools/generator/FakerNatureTool.vue') },
				{ path: 'faker-vehicle', component: () => import('@/component/tools/generator/FakerVehicleTool.vue') },
				{ path: 'regex', component: () => import('@/component/tools/text/RegexTool.vue') },
				{ path: 'diff', component: () => import('@/component/tools/text/DiffTool.vue') },
				{ path: 'word-count', component: () => import('@/component/tools/text/WordCount.vue') },
				{ path: 'ssh-keygen', component: () => import('@/component/tools/ssh/SshKeyGen.vue') },
				{ path: 'favicon', component: () => import('@/component/tools/image/FaviconTool.vue') },
				{ path: 'ai-tester', component: () => import('@/component/tools/ai/AiApiTester.vue') },
				{ path: 'license-selector', component: () => import('@/component/tools/common/LicenseSelector.vue') },
				{
					path: 'virtio-download',
					component: () => import('@/component/tools/virtualization/VirtioDownloadTool.vue')
				}
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
