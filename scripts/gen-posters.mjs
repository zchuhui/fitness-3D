/**
 * 海报资产批量生成（dev 工具）：
 * 启动无头 Chrome 访问 /poster-studio，点「生成全部」，
 * 轮询等 30 个动作的海报全部 POST 落盘到 public/posters/。
 *
 * 用法：先起 dev server，然后 `node scripts/gen-posters.mjs`
 */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const TOTAL = 30
const TIMEOUT_MIN = 12

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1400,1000',
  ],
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 1000 })
  page.on('pageerror', (e) => console.log('[pageerror]', e.message))
  page.on('console', (m) => {
    const t = m.text()
    if (/error|failed/i.test(t)) console.log('[console]', t)
  })

  console.log('open', `${BASE}/poster-studio`)
  await page.goto(`${BASE}/poster-studio`, { waitUntil: 'networkidle2', timeout: 60_000 })

  await page.waitForSelector('.tb-btn.primary', { timeout: 30_000 })
  await page.click('.tb-btn.primary')
  console.log('started, waiting for posters...')

  const deadline = Date.now() + TIMEOUT_MIN * 60_000
  let done = 0
  while (Date.now() < deadline) {
    done = await page.$$eval('.page ul li', (els) => els.length).catch(() => 0)
    process.stdout.write(`\rposters: ${done}/${TOTAL}   `)
    if (done >= TOTAL) break
    await new Promise((r) => setTimeout(r, 1000))
  }
  process.stdout.write('\n')

  const items = await page.$$eval('.page ul li', (els) => els.map((e) => e.textContent ?? ''))
  for (const it of items) console.log(it.trim())
  if (done < TOTAL) {
    console.log(`TIMEOUT: only ${done}/${TOTAL} posters generated`)
    process.exitCode = 1
  }
} finally {
  await browser.close()
}
