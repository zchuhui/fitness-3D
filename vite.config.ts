import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'FitMotion 3D — 3D 交互式健身动作库',
        short_name: 'FitMotion 3D',
        description: '360° 看清每个健身动作：关键帧教学、错误对比、跟练计时。',
        theme_color: '#0d1017',
        background_color: '#0d1017',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // 3D 模型体积大：运行时缓存（首次看过后离线可看），不做预缓存
        runtimeCaching: [
          {
            urlPattern: /\.(glb|fbx)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fitmotion-models',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: false,
    watch: {
      // 忽略浏览器下载中的临时文件，避免文件锁导致 watcher 崩溃
      ignored: ['**/*.crdownload', '**/*.part', '**/*.tmp'],
    },
  },
})
