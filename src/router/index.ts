import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/view/Home.vue';

const TOKEN_KEY = 'tku-auth-token';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', component: Home },
		{
			path: '/tool',
			component: () => import('@/view/ToolPage.vue'),
			children: [
				{ path: 'base64', component: () => import('@/view/tool/codec/Base64View.vue') },
				{ path: 'url-encode', component: () => import('@/view/tool/codec/UrlEncodeView.vue') },
				{ path: 'unicode', component: () => import('@/view/tool/codec/UnicodeView.vue') },
				{ path: 'encoding', component: () => import('@/view/tool/codec/EncodingView.vue') },
				{ path: 'json-formatter', component: () => import('@/view/tool/formatter/JsonFormatterView.vue') },
				{ path: 'sql-formatter', component: () => import('@/view/tool/formatter/SqlFormatterView.vue') },
				{ path: 'timestamp', component: () => import('@/view/tool/converter/TimestampView.vue') },
				{ path: 'color', component: () => import('@/view/tool/converter/ColorView.vue') },
				{ path: 'uuid', component: () => import('@/view/tool/generator/UuidView.vue') },
				{ path: 'hash', component: () => import('@/view/tool/generator/HashView.vue') },
				{ path: 'qrcode', component: () => import('@/view/tool/generator/QrcodeView.vue') },
				{ path: 'password', component: () => import('@/view/tool/generator/PasswordView.vue') },
				{ path: 'faker-identity', component: () => import('@/view/tool/generator/FakerIdentityView.vue') },
				{ path: 'faker-address', component: () => import('@/view/tool/generator/FakerAddressView.vue') },
				{ path: 'faker-company', component: () => import('@/view/tool/generator/FakerCompanyView.vue') },
				{ path: 'faker-network', component: () => import('@/view/tool/generator/FakerNetworkView.vue') },
				{ path: 'faker-text', component: () => import('@/view/tool/generator/FakerTextView.vue') },
				{ path: 'faker-finance', component: () => import('@/view/tool/generator/FakerFinanceView.vue') },
				{ path: 'faker-nature', component: () => import('@/view/tool/generator/FakerNatureView.vue') },
				{ path: 'faker-vehicle', component: () => import('@/view/tool/generator/FakerVehicleView.vue') },
				{ path: 'regex', component: () => import('@/view/tool/text/RegexView.vue') },
				{ path: 'diff', component: () => import('@/view/tool/text/DiffView.vue') },
				{ path: 'word-count', component: () => import('@/view/tool/text/WordCountView.vue') },
				{ path: 'ssh-keygen', component: () => import('@/view/tool/ssh/SshKeyGenView.vue') },
				{ path: 'favicon', component: () => import('@/view/tool/image/FaviconView.vue') },
				{ path: 'ai-tester', component: () => import('@/view/tool/ai/AiApiTesterView.vue') },
				{ path: 'license-selector', component: () => import('@/view/tool/common/LicenseSelectorView.vue') },
				{ path: 'virtio-download', component: () => import('@/view/tool/virtualization/VirtioDownloadView.vue') }
			]
		},
		{
			path: '/login',
			component: () => import('@/view/Login.vue')
		},
		{
			path: '/admin/config',
			component: () => import('@/view/Settings.vue')
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
