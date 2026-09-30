/* 运行时动作合理性校验：在 Node 里加载 Xbot.glb，烘焙新动作并检查关键约束 */
import { build } from 'esbuild'
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const HERE = new URL('.', import.meta.url)
const OUT = fileURLToPath(new URL('.tmp-sanity.mjs', HERE))

await build({
  entryPoints: [fileURLToPath(new URL('sanity-entry.ts', HERE))],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  logLevel: 'silent',
  external: [],
})

const { run } = await import(`file:///${OUT.replace(/\\/g, '/')}?t=${Date.now()}`)
run()

rmSync(OUT, { force: true })
