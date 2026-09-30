import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/**
 * 开发专用中间件：/poster-studio 页面把离屏渲染的卡片海报
 * POST 到 /__save-poster，写入 public/posters/ 成为静态资产。
 * 生产构建不依赖此插件（海报已落盘）。
 */
function posterSaver(): Plugin {
  return {
    name: 'fitmotion-poster-saver',
    configureServer(server) {
      server.middlewares.use('/__save-poster', (req, res) => {
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', async () => {
          try {
            const { id, dataUrl } = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            const m = /^data:image\/(webp|png);base64,(.+)$/.exec(String(dataUrl ?? ''))
            if (!/^[a-z0-9-]+$/.test(String(id ?? '')) || !m) {
              throw new Error('bad payload')
            }
            const dir = path.resolve(projectRoot, 'public/posters')
            await fs.mkdir(dir, { recursive: true })
            const file = `${id}.${m[1]}`
            await fs.writeFile(path.join(dir, file), Buffer.from(m[2], 'base64'))
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ ok: true, file: `posters/${file}` }))
          } catch (err) {
            res.statusCode = 400
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    posterSaver(),
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webp}'],
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
