import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { configPlugin } from './vite-plugin-config.ts';

export default defineConfig({
	plugins: [vue(), tailwindcss(), configPlugin()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			// iconv-lite 内部依赖 Node 内置 buffer，浏览器端需 polyfill，否则编码探测工具懒加载时崩溃
			buffer: 'buffer/'
		}
	}
});
