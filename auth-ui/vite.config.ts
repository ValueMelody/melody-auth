import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/identity': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
