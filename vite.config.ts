import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 支持灵活的子目录部署：可通过环境变量 VITE_BASE_URL 设置任意子目录路径
    // 例如：VITE_BASE_URL=/my-game/ 表示部署到 /my-game/ 子目录
    // 留空或默认为 './' (根目录部署)
    base: env.VITE_BASE_URL || './',
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
  }
})
