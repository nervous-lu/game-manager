import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 支持子目录部署：可通过环境变量 VITE_BASE_URL 设置子目录路径
  // 例如：VITE_BASE_URL=/my-game/ 或者默认为 './' (根目录)
  base: process.env.VITE_BASE_URL || './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/common.scss" as *;`
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vant']
  }
})
