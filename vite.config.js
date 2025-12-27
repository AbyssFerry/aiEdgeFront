import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api/management': {
        target: 'http://localhost:23058',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/management/, '')
      },
      '/api/inference': {
        target: 'http://localhost:23059',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/inference/, '')
      }
    }
  }
})
