import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { configPlugin } from './vite-plugin-config.ts';

export default defineConfig({
	plugins: [vue(), tailwindcss(), configPlugin()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	define: {
		Buffer: ['buffer', 'Buffer']
	}
});
