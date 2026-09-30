import {
  AnimationClip,
  AnimationMixer,
  Bone,
  Euler,
  Object3D,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack,
} from 'three'
import { getMotion } from './catalog'
import type { EulerDeg, MotionDef, MotionPose, MotionSegment } from './motions'

const DEG = Math.PI / 180
const HIP = 'mixamorigHips'

/** 每条生成动画都写全这些骨骼，切换动作时不会残留上一个动作的姿势 */
const BODY_BONES = [
  HIP,
  'mixamorigSpine',
  'mixamorigSpine1',
  'mixamorigSpine2',
  'mixamorigNeck',
  'mixamorigHead',
  'mixamorigLeftShoulder',
  'mixamorigLeftArm',
  'mixamorigLeftForeArm',
  'mixamorigRightShoulder',
  'mixamorigRightArm',
  'mixamorigRightForeArm',
  'mixamorigLeftUpLeg',
  'mixamorigLeftLeg',
  'mixamorigLeftFoot',
  'mixamorigRightUpLeg',
  'mixamorigRightLeg',
  'mixamorigRightFoot',
]
const REST_HIP: [number, number, number] = [0, 103.991, 2.076]
const FOOT_Y = 0.08
const TOE_Y = 0
/** 支撑类动作手掌离地高度（米） */
const HAND_Y = 0.09

const cache = new WeakMap<Object3D, Map<string, AnimationClip>>()
const sampleCache = new WeakMap<Object3D, Map<string, FrameSample[]>>()

const eulerQuat = (e: EulerDeg) =>
  new Quaternion().setFromEuler(new Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG, 'XYZ'))

const fullName = (short: string) => (short.startsWith('mixamorig') ? short : 'mixamorig' + short)

interface Rig {
  root: Object3D
  bones: Map<string, Bone>
  hips: Bone
  scale: number
  saved: { bone: Bone; q: Quaternion; p: Vector3 }[]
}

function bindRig(root: Object3D): Rig {
  const bones = new Map<string, Bone>()
  const saved: Rig['saved'] = []
  root.traverse((o) => {
    const bone = o as Bone
    if (!bone.isBone) return
    bones.set(bone.name, bone)
    saved.push({ bone, q: bone.quaternion.clone(), p: bone.position.clone() })
  })
  const hips = bones.get(HIP)
  if (!hips) throw new Error('模型里没有 Mixamo 髋骨，无法生成动作')
  root.updateMatrixWorld(true)
  const scale = new Vector3()
  hips.parent?.getWorldScale(scale)
  return { root, bones, hips, scale: scale.x || 0.01, saved }
}

function restore(rig: Rig) {
  for (const s of rig.saved) {
    s.bone.quaternion.copy(s.q)
    s.bone.position.copy(s.p)
  }
  rig.root.updateMatrixWorld(true)
}

function smooth(u: number) {
  const t = Math.min(1, Math.max(0, u))
  return t * t * (3 - 2 * t)
}

/**
 * tempo > 1 离心（慢到位），tempo < 1 向心（快到位），hold 是段末停住的比例。
 * 返回值已经是缓动后的 0–1，blendPose 不再二次 smooth。
 */
function segmentBlend(u: number, seg?: MotionSegment) {
  const hold = Math.min(0.45, Math.max(0, seg?.hold ?? 0))
  const span = 1 - hold
  const move = span < 1e-4 ? 1 : Math.min(1, Math.max(0, u / span))
  const s = smooth(move)
  const tempo = seg?.tempo ?? 1
  if (tempo > 1.05) return Math.pow(s, Math.min(tempo, 3))
  if (tempo < 0.95) return 1 - Math.pow(1 - s, 1 / Math.max(0.35, tempo))
  return s
}

function blendPose(a: MotionPose, b: MotionPose, u: number): MotionPose {
  const k = Math.min(1, Math.max(0, u))
  const names = new Set([...Object.keys(a.rot), ...Object.keys(b.rot)])
  const rot: Record<string, EulerDeg> = {}
  for (const name of names) {
    const q = eulerQuat(a.rot[name] ?? [0, 0, 0]).slerp(eulerQuat(b.rot[name] ?? [0, 0, 0]), k)
    const e = new Euler().setFromQuaternion(q, 'XYZ')
    rot[name] = [(e.x * 180) / Math.PI, (e.y * 180) / Math.PI, (e.z * 180) / Math.PI]
  }
  const ha = a.hips ?? b.hips
  const hb = b.hips ?? a.hips
  const hips = ha && hb ? (ha.map((v, i) => v + (hb[i] - v) * k) as [number, number, number]) : undefined
  const ra = a.hipsRot ?? b.hipsRot ?? [0, 0, 0]
  const rb = b.hipsRot ?? a.hipsRot ?? [0, 0, 0]
  const hipsRotQ = eulerQuat(ra).slerp(eulerQuat(rb), k)
  const he = new Euler().setFromQuaternion(hipsRotQ, 'XYZ')
  return {
    t: a.t + (b.t - a.t) * u,
    rot,
    hop: (a.hop ?? 0) + ((b.hop ?? 0) - (a.hop ?? 0)) * k,
    hips,
    hipsRot: a.hipsRot || b.hipsRot ? [(he.x * 180) / Math.PI, (he.y * 180) / Math.PI, (he.z * 180) / Math.PI] : undefined,
  }
}

function poseAt(motion: MotionDef, time: number): MotionPose {
  const poses = motion.poses
  if (time <= poses[0].t) return poses[0]
  const last = poses[poses.length - 1]
  if (time >= last.t) return last
  let i = 0
  while (i < poses.length - 2 && poses[i + 1].t < time) i++
  const a = poses[i]
  const b = poses[i + 1]
  const span = b.t - a.t || 1
  return blendPose(a, b, segmentBlend((time - a.t) / span, motion.segments?.[i]))
}

function worldOf(bone: Bone, target: Vector3) {
  bone.getWorldPosition(target)
  return target
}

/** 把某个姿势落到角色上，并按着地方式修正髋部。handAnchor 在双手固定时于第一帧写入。 */
function applyPose(rig: Rig, motion: MotionDef, pose: MotionPose, handAnchor: Vector3 | null) {
  for (const bone of rig.bones.values()) bone.quaternion.identity()
  rig.hips.position.set(...REST_HIP)
  rig.hips.quaternion.identity()

  for (const [name, e] of Object.entries(pose.rot)) {
    const bone = rig.bones.get(fullName(name))
    if (bone) bone.quaternion.copy(eulerQuat(e))
  }
  if (pose.hipsRot) rig.hips.quaternion.copy(eulerQuat(pose.hipsRot))
  if (motion.plant === 'none' && pose.hips) rig.hips.position.set(...pose.hips)

  rig.root.updateMatrixWorld(true)

  const left = new Vector3()
  const right = new Vector3()
  const s = rig.scale

  if (motion.plant === 'feet' || motion.plant === 'toes') {
    const lName = motion.plant === 'toes' ? 'mixamorigLeftToeBase' : 'mixamorigLeftFoot'
    const rName = motion.plant === 'toes' ? 'mixamorigRightToeBase' : 'mixamorigRightFoot'
    worldOf(rig.bones.get(lName)!, left)
    worldOf(rig.bones.get(rName)!, right)
    const targetY = motion.plant === 'toes' ? TOE_Y : FOOT_Y
    const bothDown = Math.abs(left.y - right.y) < 0.05
    let dx: number
    let dy: number
    let dz: number
    if (bothDown) {
      dx = -(left.x + right.x) / 2
      dy = targetY - Math.min(left.y, right.y)
      dz = -(left.z + right.z) / 2
    } else if (left.y <= right.y) {
      dx = 0.08 - left.x
      dy = targetY - left.y
      dz = -left.z
    } else {
      dx = -0.08 - right.x
      dy = targetY - right.y
      dz = -right.z
    }
    rig.hips.position.x += dx / s
    rig.hips.position.y += dy / s
    rig.hips.position.z += dz / s
  } else if (motion.plant === 'hands') {
    worldOf(rig.bones.get('mixamorigLeftHand')!, left)
    worldOf(rig.bones.get('mixamorigRightHand')!, right)
    const mid = left.add(right).multiplyScalar(0.5)
    if (!handAnchor) {
      // 支撑类动作（俯卧撑/平板，手在髋下方）：双手钉在地面高度
      // 引体向上（手在髋上方）：手锚定在第一帧的杠位
      const hipsW = worldOf(rig.hips, new Vector3())
      handAnchor =
        mid.y < hipsW.y ? new Vector3(mid.x, HAND_Y, mid.z) : mid.clone()
    }
    rig.hips.position.x += (handAnchor.x - mid.x) / s
    rig.hips.position.y += (handAnchor.y - mid.y) / s
    rig.hips.position.z += (handAnchor.z - mid.z) / s
  }

  if (pose.hop) rig.hips.position.y += pose.hop / s
  rig.root.updateMatrixWorld(true)
  return handAnchor
}

export interface FrameSample {
  t: number
  footL: number[]
  footR: number[]
  handL: number[]
  handR: number[]
  head: number[]
  hips: number[]
}

function readSample(rig: Rig, t: number): FrameSample {
  const p = new Vector3()
  const grab = (name: string) =>
    worldOf(rig.bones.get(name)!, p)
      .toArray()
      .map((n) => +n.toFixed(3))
  return {
    t: +t.toFixed(3),
    footL: grab('mixamorigLeftFoot'),
    footR: grab('mixamorigRightFoot'),
    handL: grab('mixamorigLeftHand'),
    handR: grab('mixamorigRightHand'),
    head: grab('mixamorigHead'),
    hips: grab(HIP),
  }
}

const BREATH_AMP: Record<string, number> = {
  mixamorigSpine: 0.01,
  mixamorigSpine1: 0.018,
  mixamorigSpine2: 0.014,
}

/** 胸腔骨骼叠一层慢正弦，静止动作（平板支撑等）不会僵住 */
function applyBreath(times: number[], quatValues: Map<string, number[]>) {
  const axis = new Vector3(1, 0, 0)
  const breathQ = new Quaternion()
  const tmpQ = new Quaternion()
  for (const [name, amp] of Object.entries(BREATH_AMP)) {
    const arr = quatValues.get(name)
    if (!arr) continue
    for (let i = 0; i < times.length; i++) {
      const w = Math.sin(times[i] * Math.PI * 2 * 0.5) * amp
      breathQ.setFromAxisAngle(axis, w)
      tmpQ.fromArray(arr, i * 4).multiply(breathQ)
      tmpQ.toArray(arr, i * 4)
    }
  }
}

function runMotion(rig: Rig, id: string, times: number[]) {
  const motion = getMotion(id)
  if (!motion) throw new Error(`没有这个生成动作：${id}`)
  let handAnchor: Vector3 | null = null
  const samples: FrameSample[] = []
  const hipPos: number[] = []
  const hipQuat: number[] = []
  const boneNames = new Set<string>(BODY_BONES)
  for (const pose of motion.poses) for (const name of Object.keys(pose.rot)) boneNames.add(fullName(name))
  const quatValues = new Map<string, number[]>()
  for (const name of boneNames) quatValues.set(name, [])

  for (const t of times) {
    const pose = poseAt(motion, t)
    handAnchor = applyPose(rig, motion, pose, handAnchor)
    samples.push(readSample(rig, t))
    hipPos.push(rig.hips.position.x, rig.hips.position.y, rig.hips.position.z)
    rig.hips.quaternion.toArray(hipQuat, hipQuat.length)
    for (const name of boneNames) {
      const bone = rig.bones.get(name)
      const arr = quatValues.get(name)!
      if (bone) bone.quaternion.toArray(arr, arr.length)
      else arr.push(0, 0, 0, 1)
    }
  }

  applyBreath(times, quatValues)

  const tracks = [
    new VectorKeyframeTrack(`${HIP}.position`, times, hipPos),
    new QuaternionKeyframeTrack(`${HIP}.quaternion`, times, hipQuat),
  ]
  for (const [name, values] of quatValues) {
    if (name === HIP) continue
    tracks.push(new QuaternionKeyframeTrack(`${name}.quaternion`, times, values))
  }
  return { clip: new AnimationClip(id, motion.duration, tracks), samples }
}

/** 在 X Bot 上烘焙一条循环动作。结果按模型缓存，不会重复改骨骼。 */
export function buildGeneratedClip(root: Object3D, id: string): AnimationClip {
  let byId = cache.get(root)
  if (!byId) cache.set(root, (byId = new Map()))
  const hit = byId.get(id)
  if (hit) return hit

  const rig = bindRig(root)
  try {
    const motion = getMotion(id)
    if (!motion) throw new Error(`没有这个生成动作：${id}`)
    const n = Math.max(2, Math.round(motion.duration * 30))
    const times = Array.from({ length: n + 1 }, (_, i) => (i / n) * motion.duration)
    const { clip, samples } = runMotion(rig, id, times)
    byId.set(id, clip)
    let samplesById = sampleCache.get(root)
    if (!samplesById) sampleCache.set(root, (samplesById = new Map()))
    samplesById.set(id, samples)
    return clip
  } finally {
    restore(rig)
  }
}

/** 生成动作烘焙时记下的手足髋轨迹。没有则返回 null。 */
export function motionSamples(root: Object3D, id: string): FrameSample[] | null {
  return sampleCache.get(root)?.get(id) ?? null
}

function endpoints(root: Object3D) {
  const bones = new Map<string, Bone>()
  root.traverse((o) => {
    const bone = o as Bone
    if (bone.isBone) bones.set(bone.name.replace(/^mixamorig:?/, ''), bone)
  })
  return bones
}

/**
 * 动捕剪辑没有程序采样时，用混合器逐帧读世界坐标。
 * 读完把骨骼转回进入前的姿势，避免把正在播放的模型钉死。
 */
export function sampleClipWorld(root: Object3D, clip: AnimationClip): FrameSample[] {
  const saved: { bone: Bone; q: Quaternion; p: Vector3 }[] = []
  root.traverse((o) => {
    const bone = o as Bone
    if (!bone.isBone) return
    saved.push({ bone, q: bone.quaternion.clone(), p: bone.position.clone() })
  })
  const bones = endpoints(root)
  const mixer = new AnimationMixer(root)
  const action = mixer.clipAction(clip)
  action.play()
  const n = Math.max(2, Math.round(Math.max(clip.duration, 0.1) * 30))
  const p = new Vector3()
  const grab = (short: string) => {
    const bone = bones.get(short)
    if (!bone) return [0, 0, 0]
    return bone.getWorldPosition(p).toArray().map((v) => +v.toFixed(3))
  }
  const samples: FrameSample[] = []
  try {
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * clip.duration
      mixer.setTime(t)
      root.updateMatrixWorld(true)
      samples.push({
        t: +t.toFixed(3),
        footL: grab('LeftFoot'),
        footR: grab('RightFoot'),
        handL: grab('LeftHand'),
        handR: grab('RightHand'),
        head: grab('Head'),
        hips: grab('Hips'),
      })
    }
    return samples
  } finally {
    mixer.stopAllAction()
    mixer.uncacheClip(clip)
    for (const s of saved) {
      s.bone.quaternion.copy(s.q)
      s.bone.position.copy(s.p)
    }
    root.updateMatrixWorld(true)
  }
}

/** 给校验脚本看关键帧落地情况，不写入缓存。 */
export function debugMotion(root: Object3D, id: string, steps = 8): FrameSample[] {
  const rig = bindRig(root)
  try {
    const motion = getMotion(id)
    if (!motion) throw new Error(`没有这个生成动作：${id}`)
    const times = Array.from({ length: steps + 1 }, (_, i) => (i / steps) * motion.duration)
    return runMotion(rig, id, times).samples
  } finally {
    restore(rig)
  }
}
