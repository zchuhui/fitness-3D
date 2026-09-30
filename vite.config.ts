import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    watch: {
      // 忽略浏览器下载中的临时文件，避免文件锁导致 watcher 崩溃
      ignored: ['**/*.crdownload', '**/*.part', '**/*.tmp'],
    },
  },
})
