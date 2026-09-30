/* 一次性校验：数据跨文件一致性（node scripts/validate.mjs） */
import { build } from 'esbuild'
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const HERE = new URL('.', import.meta.url)
const OUT = fileURLToPath(new URL('.tmp-validate.mjs', HERE))

await build({
  entryPoints: [fileURLToPath(new URL('validate-entry.ts', HERE))],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: OUT,
  logLevel: 'silent',
})

const { exercises, MOTIONS } = await import(`file:///${OUT.replace(/\\/g, '/')}?t=${Date.now()}`)

let bad = 0
const fail = (msg) => {
  bad++
  console.error('✗ ' + msg)
}

for (const e of exercises) {
  // keyframes
  if (!e.keyframes?.length) fail(`${e.id}: 缺少 keyframes`)
  else {
    const seen = new Set()
    for (const k of e.keyframes) {
      if (k.point >= e.keyPoints.length) fail(`${e.id}: keyframes 下标越界 point=${k.point}`)
      if (k.at < 0 || k.at > 1) fail(`${e.id}: keyframes at 越界 at=${k.at}`)
      if (seen.has(k.at)) fail(`${e.id}: keyframes at 重复 at=${k.at}`)
      seen.add(k.at)
    }
  }
  // errors
  if (e.errors?.length) {
    if (!(e.compareMotion || e.generated)) fail(`${e.id}: 有 errors 但没有可用的标准生成动作`)
    for (const err of e.errors) {
      if (!MOTIONS[err.motionId]) fail(`${e.id}: errors 引用不存在的动作 ${err.motionId}`)
      if (!e.mistakes.includes(err.label)) fail(`${e.id}: errors label 与 mistakes 不匹配「${err.label}」`)
    }
  }
  if (e.compareMotion && !MOTIONS[e.compareMotion]) fail(`${e.id}: compareMotion 不存在 ${e.compareMotion}`)
  // program
  if (e.program) {
    const p = e.program
    if (p.sets < 1 || p.sets > 10) fail(`${e.id}: program.sets 异常 ${p.sets}`)
    if (!p.reps && !p.seconds) fail(`${e.id}: program 缺 reps/seconds`)
    if (p.reps && p.seconds) fail(`${e.id}: program 同时有 reps 和 seconds`)
    if (p.restSeconds < 10 || p.restSeconds > 300) fail(`${e.id}: restSeconds 异常 ${p.restSeconds}`)
  } else {
    fail(`${e.id}: 缺少 program（跟练页需要）`)
  }
  // generated 引用的 clip 必须存在
  if (e.generated && e.model.clip && !MOTIONS[e.model.clip]) fail(`${e.id}: generated clip 不存在 ${e.model.clip}`)
}

console.log(
  bad === 0
    ? `✓ 全部通过：${exercises.length} 个动作 · ${Object.keys(MOTIONS).length} 个生成动作`
    : `✗ ${bad} 处问题`,
)

rmSync(OUT, { force: true })
process.exit(bad === 0 ? 0 : 1)
