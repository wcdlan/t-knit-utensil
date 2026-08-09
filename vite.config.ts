import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import {configPlugin} from './vite-plugin-config.ts'

export default defineConfig({
    plugins: [vue(), tailwindcss(), configPlugin()],
})
