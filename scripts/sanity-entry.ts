import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three-stdlib'
import { debugMotion } from '../src/motion/buildClip'
import type { FrameSample } from '../src/motion/buildClip'

const buf = readFileSync(new URL('../public/models/Xbot.glb', import.meta.url))
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer

const loader = new GLTFLoader()
const gltf = await new Promise((res, rej) => loader.parse(ab, '', res as never, rej as never))
const scene = (gltf as { scene: import('three').Object3D }).scene

/** 帧间某骨点的漂移范围（x/z 平面，检查手是否钉住） */
function drift(samples: FrameSample[], pick: (f: FrameSample) => number[]) {
  const xs = samples.map((s) => pick(s)[0])
  const zs = samples.map((s) => pick(s)[2])
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs))
}

export function run() {
  const FEET_MOTIONS = ['squat', 'squat-x-valgus', 'deadlift-x-arch', 'deadlift-x-hyper', 'bicep-curl-x-swing', 'good-morning-x-arch']
  const HANDS_MOTIONS = ['push-up', 'push-up-x-sag', 'plank', 'plank-x-sag', 'pull-up']
  const FLOOR_NONE_MOTIONS = ['bench-press-x-flare', 'sit-up', 'bench-press']
  let bad = 0

  // 双脚钉地：双脚 y 应始终贴近地面
  for (const id of FEET_MOTIONS) {
    const s = debugMotion(scene, id, 10)
    const footY = [...s.map((f) => f.footL[1]), ...s.map((f) => f.footR[1])]
    const minY = Math.min(...footY)
    const maxY = Math.max(...footY)
    const ok = minY > -0.05 && maxY < 0.25
    if (!ok) bad++
    console.log(
      `${ok ? '✓' : '✗'} ${id} 脚高 y∈[${minY.toFixed(2)}, ${maxY.toFixed(2)}] 髋高 y∈[${Math.min(...s.map((f) => f.hips[1])).toFixed(2)}, ${Math.max(...s.map((f) => f.hips[1])).toFixed(2)}]`,
    )
  }

  // 手锚定：双手 x/z 漂移应很小（钉在手位）；俯卧类手贴地、身体低
  for (const id of HANDS_MOTIONS) {
    const s = debugMotion(scene, id, 10)
    const d = Math.max(drift(s, (f) => f.handL), drift(s, (f) => f.handR))
    const handY = s.map((f) => (f.handL[1] + f.handR[1]) / 2)
    const handYRange = Math.max(...handY) - Math.min(...handY)
    const hipY = s.map((f) => f.hips[1])
    const prone = id !== 'pull-up'
    // 引体向上是原有动作：双手高度钉在杠位即可（两臂拉起时对称收拢属正常视觉）
    const driftLimit = prone ? 0.12 : 0.3
    const bodyOk = prone
      ? Math.min(...hipY) > 0.1 && Math.max(...hipY) < 0.8 && Math.max(...handY) < 0.2 && Math.min(...handY) > -0.05
      : Math.min(...hipY) > 0.2 && handYRange < 0.05
    const ok = d < driftLimit && bodyOk
    if (!ok) bad++
    console.log(
      `${ok ? '✓' : '✗'} ${id} 手漂移 ${d.toFixed(3)}m 手高y∈[${Math.min(...handY).toFixed(2)}, ${Math.max(...handY).toFixed(2)}] 髋y∈[${Math.min(...hipY).toFixed(2)}, ${Math.max(...hipY).toFixed(2)}]`,
    )
  }

  // 仰卧位（plant none）：髋部应贴地低位
  for (const id of FLOOR_NONE_MOTIONS) {
    const s = debugMotion(scene, id, 10)
    const hipY = s.map((f) => f.hips[1])
    const ok = Math.min(...hipY) > -0.1 && Math.max(...hipY) < 0.6
    if (!ok) bad++
    console.log(
      `${ok ? '✓' : '✗'} ${id} 髋高 y∈[${Math.min(...hipY).toFixed(2)}, ${Math.max(...hipY).toFixed(2)}]（仰卧贴地）`,
    )
  }

  console.log(bad === 0 ? '✓ 新增动作约束全部合理' : `✗ ${bad} 个动作需要调整角度`)
  if (bad > 0) process.exit(1)
}
