/**
 * 视觉验证截图（临时脚本）：首页 Hero / 卡片悬停 / 详情页 Dock。
 * 用法：先起 dev server，然后 `node scripts/verify-shots.mjs`
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'shots'

mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[console.error]', msg.text())
})
page.on('pageerror', (err) => console.log('[pageerror]', err.message))

// 1. 首页 Hero（等入场动画播完）
await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 6000))
await page.screenshot({ path: `${OUT}/01-hero.png` })

// 2. 滚动到动作库（卡片入场）
await page.evaluate(() => {
  document.querySelector('#library')?.scrollIntoView()
  window.scrollBy(0, -60)
})
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: `${OUT}/02-cards.png` })

// 3. 卡片悬停（tilt + 追光 + 实时 3D）
const card = await page.$('.grid .card-v2')
if (card) {
  const box = await card.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.35, { steps: 12 })
    await new Promise((r) => setTimeout(r, 3500))
    await page.screenshot({ path: `${OUT}/03-card-hover.png` })
  }
}

// 4. 详情页（悬浮 Dock + HUD）
await page.goto(`${BASE}/exercise/squat`, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 6000))
await page.screenshot({ path: `${OUT}/04-detail.png` })

await browser.close()
console.log('done')
