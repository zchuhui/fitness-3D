import type { ErrorVariant } from '../types'
import { both, MOTIONS, type EulerDeg, type MotionDef, type MotionPose, type MotionSegment } from './motions'

type Delta = Record<string, EulerDeg>
type When = 'mid' | 'end' | 'rest' | 'all'

interface Spec {
  id: string
  base: string
  when?: When
  /** 加到命中姿势上的欧拉角（度）。默认左右镜像。 */
  delta?: Delta
  mirror?: boolean
  hop?: number
  hips?: [number, number, number]
  /** 加到骨盆朝向上（度）。双脚着地的仰卧动作没有 hips，靠它把骨盆顶起或前倾 */
  hipsRot?: EulerDeg
  /** 覆盖整段节奏，用来表现忽快忽慢、没有停顿 */
  segments?: MotionSegment[]
  /** 交替快慢，并取消停顿 */
  rush?: boolean
  edit?: (pose: MotionPose, index: number, count: number) => void
  /** 去掉这些下标的姿势（错误轨迹不经过标准动作的中间点） */
  drop?: number[]
}

function cloneMotion(baseId: string): MotionDef {
  const base = MOTIONS[baseId]
  if (!base) throw new Error(`缺少基础动作 ${baseId}`)
  return {
    duration: base.duration,
    plant: base.plant,
    segments: base.segments?.map((segment) => ({ ...segment })),
    poses: base.poses.map((pose) => ({
      t: pose.t,
      rot: Object.fromEntries(Object.entries(pose.rot).map(([name, euler]) => [name, [...euler] as EulerDeg])),
      hop: pose.hop,
      shift: pose.shift ? ([...pose.shift] as [number, number, number]) : undefined,
      hips: pose.hips ? ([...pose.hips] as [number, number, number]) : undefined,
      hipsRot: pose.hipsRot ? ([...pose.hipsRot] as EulerDeg) : undefined,
    })),
  }
}

function addRot(rot: Record<string, EulerDeg>, delta: Delta, mirror: boolean) {
  const extra = mirror ? both(delta) : delta
  const out: Record<string, EulerDeg> = { ...rot }
  for (const [name, euler] of Object.entries(extra)) {
    const base = out[name] ?? [0, 0, 0]
    out[name] = [base[0] + euler[0], base[1] + euler[1], base[2] + euler[2]]
  }
  return out
}

function hits(when: When, index: number, count: number) {
  if (when === 'all') return true
  if (when === 'rest') return index > 0
  if (when === 'end') return index >= Math.max(1, count - 2)
  return index > 0 && index < count - 1
}

function buildSpec(spec: Spec): MotionDef {
  const motion = cloneMotion(spec.base)
  const count = motion.poses.length
  const when = spec.when ?? 'mid'
  for (let i = 0; i < count; i++) {
    if (!hits(when, i, count)) continue
    const pose = motion.poses[i]
    if (spec.delta) pose.rot = addRot(pose.rot, spec.delta, spec.mirror !== false)
    if (spec.hop != null) pose.hop = spec.hop
    if (spec.hips && pose.hips) {
      pose.hips = [pose.hips[0] + spec.hips[0], pose.hips[1] + spec.hips[1], pose.hips[2] + spec.hips[2]]
    }
    if (spec.hipsRot && pose.hipsRot) {
      pose.hipsRot = [pose.hipsRot[0] + spec.hipsRot[0], pose.hipsRot[1] + spec.hipsRot[1], pose.hipsRot[2] + spec.hipsRot[2]]
    }
    spec.edit?.(pose, i, count)
  }
  if (spec.drop) {
    const keep = (_: unknown, i: number) => !spec.drop!.includes(i)
    motion.segments = motion.segments?.filter((_, i) => keep(_, i + 1))
    motion.poses = motion.poses.filter(keep)
  }
  if (spec.segments) motion.segments = spec.segments
  if (spec.rush) {
    motion.segments = Array.from({ length: Math.max(1, count - 1) }, (_, i) => ({
      tempo: i % 2 === 0 ? 0.42 : 1.85,
      hold: 0,
    }))
  }
  return motion
}

/** 平板塌腰后骨盆倾角与平移的修正，让双手仍撑在原处 */
const BURPEE_SAG_TILT = -13.3
const BURPEE_SAG_SHIFT_Z = -0.018

const SPECS: Spec[] = [
  { id: 'squat-x-heels', base: 'squat', delta: { LeftFoot: [40, 0, 0], Spine: [8, 0, 0] } },
  { id: 'squat-x-round', base: 'squat', delta: { Spine: [22, 0, 0], Spine1: [14, 0, 0], Neck: [12, 0, 0], Head: [10, 0, 0] } },
  { id: 'squat-x-shallow', base: 'squat', delta: { LeftUpLeg: [34, 0, 0], LeftLeg: [-48, 0, 0] } },
  { id: 'squat-x-knees', base: 'squat', delta: { LeftUpLeg: [30, 0, 0], LeftLeg: [18, 0, 0], LeftFoot: [14, 0, 0] } },

  { id: 'ohs-x-bend', base: 'overhead-squat', delta: { LeftForeArm: [0, -58, 0], LeftArm: [12, -24, 0] } },
  { id: 'ohs-x-lean', base: 'overhead-squat', delta: { Spine: [22, 0, 0], Spine1: [10, 0, 0] } },
  { id: 'ohs-x-loose', base: 'overhead-squat', delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0], LeftUpLeg: [8, 0, 0] } },
  { id: 'ohs-x-shallow', base: 'overhead-squat', delta: { LeftUpLeg: [36, 0, 0], LeftLeg: [-42, 0, 0] } },

  // 底部上臂外展到与躯干约 90°（T 字），手仍在原位
  { id: 'push-up-x-flare', base: 'push-up', delta: { LeftArm: [13, -11, 58], LeftForeArm: [0, 2, 0], LeftHand: [-61, 24, 58] } },
  // 只下到肘约 77°，胸离地约 24 cm
  { id: 'push-up-x-half', base: 'push-up', delta: { LeftArm: [-33, -18, -2], LeftForeArm: [0, 36, 0], LeftHand: [3, 0, -12] } },
  {
    id: 'push-up-x-neck',
    base: 'push-up',
    when: 'all',
    // 底部胸口离地只有几厘米，低头幅度再大头就穿地了
    edit: (pose) => {
      const bottom = pose.rot.LeftForeArm[1] < -90
      pose.rot = addRot(pose.rot, bottom ? { Neck: [12, 0, 0], Head: [4, 0, 0] } : { Neck: [22, 0, 0], Head: [16, 0, 0] }, true)
    },
  },

  { id: 'jpu-x-sag', base: 'jump-push-up', when: 'all', delta: { LeftUpLeg: [14, 0, 0], Spine: [-3, 0, 0], Spine1: [11, 0, 0] } },
  {
    id: 'jpu-x-lock',
    base: 'jump-push-up',
    when: 'end',
    edit: (pose, index, count) => {
      if (index !== count - 2) return
      pose.rot = { ...pose.rot, ...both({ LeftArm: [-72, -35, -80], LeftForeArm: [0, 0, 0], LeftHand: [45, -6, 85] }) }
    },
  },
  { id: 'jpu-x-whip', base: 'jump-push-up', delta: { Spine: [24, 0, 0], Spine1: [12, 0, 0] } },
  { id: 'jpu-x-wrist', base: 'jump-push-up', delta: { LeftHand: [36, 0, 18] } },

  { id: 'deadlift-x-far', base: 'deadlift', delta: { LeftArm: [26, 18, 12], LeftForeArm: [0, -24, 0] } },
  { id: 'deadlift-x-hips', base: 'deadlift', delta: { LeftLeg: [-34, 0, 0], Spine: [12, 0, 0], LeftUpLeg: [-10, 0, 0] } },

  // 髋部高出肩踝连线约 16 cm，前臂仍贴地
  { id: 'plank-x-pike', base: 'plank', when: 'all', delta: { Spine: [18, 0, 0], LeftUpLeg: [-18, 0, 0], LeftArm: [-25, 2, -2], LeftHand: [2, -2, 0] } },
  { id: 'plank-x-breath', base: 'plank', when: 'all', delta: { LeftShoulder: [12, 0, -14], Neck: [10, 0, 0] } },
  // 肘撑到肩前约 15 cm
  { id: 'plank-x-elbow', base: 'plank', when: 'all', delta: { LeftArm: [-36, -3, -1], LeftForeArm: [0, 34, 0], LeftHand: [-5, 0, 1] } },

  { id: 'lunge-x-valgus', base: 'lunge', delta: { LeftUpLeg: [0, -18, -14] } },
  {
    id: 'lunge-x-short',
    base: 'lunge',
    mirror: false,
    delta: { LeftUpLeg: [20, 0, 0], RightUpLeg: [8, 0, 0], LeftLeg: [-18, 0, 0], RightLeg: [-28, 0, 0] },
  },
  { id: 'lunge-x-lean', base: 'lunge', delta: { Spine: [16, 0, 0], Spine1: [8, 0, 0] } },
  {
    id: 'lunge-x-wobble',
    base: 'lunge',
    mirror: false,
    delta: { Spine: [0, 14, 8], LeftFoot: [8, 12, 0], RightFoot: [-8, -10, 0] },
  },

  { id: 'bicep-x-elbow', base: 'bicep-curl', delta: { LeftArm: [20, 8, 10] } },
  { id: 'bicep-x-drop', base: 'bicep-curl', rush: true },
  { id: 'bicep-x-wrist', base: 'bicep-curl', delta: { LeftHand: [42, -22, 0] } },

  { id: 'sit-up-x-neck', base: 'sit-up', delta: { Neck: [28, 0, 0], Head: [22, 0, 0] } },
  { id: 'sit-up-x-yank', base: 'sit-up', rush: true },
  // 骨盆前倾、腰椎伸展，下背拱离地面；大腿和上背保持原位
  { id: 'sit-up-x-arch', base: 'sit-up', when: 'all', delta: { Spine: [-20, 0, 0], Spine1: [-12, 0, 0], Neck: [12, 0, 0], LeftUpLeg: [-20, 0, 0] }, hipsRot: [20, 0, 0] },
  { id: 'sit-up-x-slam', base: 'sit-up', rush: true },

  { id: 'jj-x-lock', base: 'jumping-jack', when: 'rest', delta: { LeftLeg: [-10, 0, 0] } },
  {
    id: 'jj-x-loose',
    base: 'jumping-jack',
    mirror: false,
    delta: { LeftArm: [18, -28, 16], RightUpLeg: [6, 0, -8] },
  },
  { id: 'jj-x-flat', base: 'jumping-jack', when: 'end', delta: { LeftFoot: [18, 0, 0], LeftLeg: [-8, 0, 0] } },
  { id: 'jj-x-rush', base: 'jumping-jack', rush: true },

  { id: 'bench-x-wrist', base: 'bench-press', delta: { LeftHand: [32, -28, 0] } },
  { id: 'bench-x-high', base: 'bench-press', delta: { LeftForeArm: [0, -70, 0] } },
  {
    id: 'bench-x-bridge',
    base: 'bench-press',
    delta: { LeftUpLeg: [14, 0, 0], LeftLeg: [-5, 0, 0], LeftFoot: [-2, 0, 0], Neck: [12, 0, 0] },
    hipsRot: [-7, 0, 0],
  },

  { id: 'pull-up-x-kip', base: 'pull-up', delta: { Spine: [20, 0, 0], LeftUpLeg: [-24, 0, 0] } },
  { id: 'pull-up-x-half', base: 'pull-up', delta: { LeftForeArm: [0, 40, 0] } },
  { id: 'pull-up-x-shrug', base: 'pull-up', delta: { LeftShoulder: [14, 0, -16], Neck: [8, 0, 0] } },
  { id: 'pull-up-x-wide', base: 'pull-up', delta: { LeftArm: [0, 26, -18] } },

  { id: 'ohp-x-lean', base: 'overhead-press', when: 'rest', delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },
  // 肩推姿势：0 起始、1 过下巴、2 过额头、3/4 顶端、5 过额头、6 过下巴、7 起始
  {
    id: 'ohp-x-forward',
    base: 'overhead-press',
    drop: [1, 2, 5, 6],
    edit: (pose, i) => {
      if (i === 3 || i === 4) Object.assign(pose.rot, both({ LeftArm: [154, 82, -35], LeftForeArm: [0, -7, 0], LeftHand: [168, 0, 20] }))
    },
  },
  {
    id: 'ohp-x-grip',
    base: 'overhead-press',
    when: 'all',
    drop: [1, 2, 5, 6],
    edit: (pose, i, count) => {
      const top = i > 0 && i < count - 1
      Object.assign(
        pose.rot,
        top
          ? both({ LeftArm: [177, 14, -58], LeftForeArm: [0, -7, 0], LeftHand: [102, 1, 0] })
          : both({ LeftArm: [-59, 56, -47], LeftForeArm: [0, -115, 0], LeftHand: [-96, 80, 120] }),
      )
    },
  },
  { id: 'ohp-x-shrug', base: 'overhead-press', when: 'end', delta: { LeftShoulder: [16, 0, -18] } },

  // 波比跳姿势：0 站、1 蹲撑、2-3 后跳、4/5 平板、6-7 收腿、8 蹲撑、9 蹬伸、10 腾空、11 触地、12 缓冲、13 站
  {
    id: 'burpee-x-sag',
    base: 'burpee',
    edit: (pose, i) => {
      if (i !== 4 && i !== 5) return
      pose.rot = addRot(pose.rot, { LeftUpLeg: [18, 0, 0], Spine: [-2, 0, 0], Spine1: [14, 0, 0] }, true)
      pose.hipsRot = [pose.hipsRot![0] + BURPEE_SAG_TILT, 0, 0]
      pose.shift = [0, 0, pose.shift![2] + BURPEE_SAG_SHIFT_Z]
    },
  },
  {
    id: 'burpee-x-lock',
    base: 'burpee',
    edit: (pose, i) => {
      if (i === 12) Object.assign(pose.rot, both({ LeftUpLeg: [-3, 0, 3], LeftLeg: [3, 0, 0], LeftFoot: [0, 0, 0], Spine: [4, 0, 0], Spine1: [0, 0, 0] }))
    },
  },
  { id: 'burpee-x-rush', base: 'burpee', rush: true },
  {
    id: 'burpee-x-sloppy',
    base: 'burpee',
    edit: (pose, i) => {
      if (i !== 10) return
      pose.rot = addRot(pose.rot, { LeftUpLeg: [-55, 0, 6], LeftLeg: [85, 0, 0], Spine: [-14, 0, 0], Spine1: [-8, 0, 0], Neck: [-14, 0, 0] }, true)
      pose.hop = 0.34
    },
  },

  { id: 'rdl-x-squat', base: 'romanian-deadlift', delta: { LeftLeg: [42, 0, 0], LeftUpLeg: [-16, 0, 0] } },
  { id: 'rdl-x-round', base: 'romanian-deadlift', delta: { Spine: [18, 0, 0], Spine1: [12, 0, 0], Neck: [10, 0, 0], Head: [8, 0, 0] } },
  { id: 'rdl-x-far', base: 'romanian-deadlift', delta: { LeftArm: [22, 16, 8] } },
  { id: 'rdl-x-hyper', base: 'romanian-deadlift', when: 'end', delta: { Spine: [-18, 0, 0], Spine1: [-10, 0, 0] } },

  { id: 'gm-x-squat', base: 'good-morning', delta: { LeftLeg: [38, 0, 0], LeftUpLeg: [-14, 0, 0] } },
  { id: 'gm-x-neck', base: 'good-morning', delta: { Neck: [18, 0, 0], Head: [22, 0, 0], Spine: [6, 0, 0] } },
  { id: 'gm-x-deep', base: 'good-morning', delta: { Spine: [16, 0, 0], Spine1: [10, 0, 0], LeftUpLeg: [-12, 0, 0] } },

  { id: 'row-x-yank', base: 'bent-over-row', delta: { Spine: [8, 14, 0] }, rush: true },
  { id: 'row-x-bounce', base: 'bent-over-row', delta: { Spine: [0, 16, 8] } },
  { id: 'row-x-flare', base: 'bent-over-row', delta: { LeftArm: [0, 22, -16] } },
  { id: 'row-x-round', base: 'bent-over-row', delta: { Spine: [14, 0, 0], Spine1: [12, 0, 0], Neck: [8, 0, 0] } },

  { id: 'rdf-x-row', base: 'rear-delt-fly', delta: { LeftForeArm: [0, -70, 0], LeftArm: [-22, 0, 0] } },
  { id: 'rdf-x-shrug', base: 'rear-delt-fly', delta: { LeftShoulder: [14, 0, -12] } },
  { id: 'rdf-x-swing', base: 'rear-delt-fly', delta: { Spine: [0, 16, 0] } },
  { id: 'rdf-x-lock', base: 'rear-delt-fly', delta: { LeftForeArm: [0, 14, 0] } },

  { id: 'lat-x-swing', base: 'lateral-raise', delta: { Spine: [16, 0, 0], Spine1: [6, 0, 0] } },
  { id: 'lat-x-high', base: 'lateral-raise', delta: { LeftArm: [0, 0, 22] } },
  { id: 'lat-x-wrist', base: 'lateral-raise', delta: { LeftHand: [0, 0, 34] } },
  { id: 'lat-x-drop', base: 'lateral-raise', rush: true },

  { id: 'front-x-sway', base: 'front-raise', delta: { Spine: [12, 12, 0] } },
  { id: 'front-x-high', base: 'front-raise', delta: { LeftArm: [-18, 0, 0] } },
  { id: 'front-x-hyper', base: 'front-raise', when: 'end', delta: { Spine: [-14, 0, 0] } },
  { id: 'front-x-lock', base: 'front-raise', delta: { LeftForeArm: [0, 14, 0] } },

  { id: 'tri-x-swing', base: 'tricep-extension', delta: { LeftArm: [16, -12, 8] } },
  { id: 'tri-x-flare', base: 'tricep-extension', delta: { LeftArm: [0, 0, -22] } },
  { id: 'tri-x-short', base: 'tricep-extension', delta: { LeftForeArm: [0, 52, 0] } },
  { id: 'tri-x-lean', base: 'tricep-extension', delta: { Spine: [-16, 0, 0] } },

  { id: 'calf-x-lean', base: 'calf-raise', delta: { Spine: [14, 0, 0] } },
  { id: 'calf-x-half', base: 'calf-raise', delta: { LeftFoot: [-28, 0, 0] } },
  { id: 'calf-x-bend', base: 'calf-raise', delta: { LeftLeg: [30, 0, 0] } },
  { id: 'calf-x-bounce', base: 'calf-raise', rush: true },

  // 跳跃深蹲姿势：0 站、1 深蹲、2 蹬伸、3 腾空、4 触地、5 缓冲、6 站
  {
    id: 'js-x-valgus',
    base: 'jump-squat',
    edit: (pose, i) => {
      if (i === 4 || i === 5) pose.rot = addRot(pose.rot, { LeftUpLeg: [0, -24, -16], LeftLeg: [0, -8, -6] }, true)
    },
  },
  {
    id: 'js-x-shallow',
    base: 'jump-squat',
    edit: (pose, i) => {
      if (i === 1) pose.rot = addRot(pose.rot, { LeftUpLeg: [34, 0, 0], LeftLeg: [-44, 0, 0], LeftFoot: [10, 0, 0], Spine: [-10, 0, 0] }, true)
      if (i === 3) pose.hop = 0.14
    },
  },
  {
    id: 'js-x-lock',
    base: 'jump-squat',
    edit: (pose, i) => {
      if (i === 5) Object.assign(pose.rot, both({ LeftUpLeg: [-3, 0, 3], LeftLeg: [3, 0, 0], LeftFoot: [0, 0, 0], Spine: [4, 0, 0], Spine1: [0, 0, 0] }))
    },
  },
  {
    id: 'js-x-round',
    base: 'jump-squat',
    edit: (pose, i) => {
      if (i === 1 || i === 2) pose.rot = addRot(pose.rot, { Spine: [16, 0, 0], Spine1: [10, 0, 0], Neck: [8, 0, 0] }, true)
    },
  },

  { id: 'hk-x-lean', base: 'high-knees', when: 'rest', delta: { Spine: [-14, 0, 0] } },
  { id: 'hk-x-stomp', base: 'high-knees', when: 'rest', delta: { LeftFoot: [16, 0, 0], LeftLeg: [-8, 0, 0] } },
  { id: 'hk-x-fold', base: 'high-knees', when: 'rest', delta: { LeftUpLeg: [36, 0, 0], LeftLeg: [14, 0, 0] } },
  { id: 'hk-x-slump', base: 'high-knees', when: 'rest', delta: { Spine: [12, 0, 0], Spine1: [8, 0, 0] } },

  { id: 'th-x-lean', base: 'thruster', delta: { Spine: [20, 0, 0], Spine1: [8, 0, 0] } },
  { id: 'th-x-press', base: 'thruster', delta: { LeftUpLeg: [40, 0, 0], LeftLeg: [-50, 0, 0] } },
  { id: 'th-x-hyper', base: 'thruster', when: 'end', delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },
  { id: 'th-x-loose', base: 'thruster', delta: { LeftArm: [14, 18, 10], LeftForeArm: [0, 18, 0] } },

  { id: 'kb-x-squat', base: 'kettlebell-swing', delta: { LeftLeg: [42, 0, 0], LeftUpLeg: [-16, 0, 0] } },
  { id: 'kb-x-arm', base: 'kettlebell-swing', delta: { LeftForeArm: [0, -55, 0] } },
  { id: 'kb-x-round', base: 'kettlebell-swing', delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0], Neck: [8, 0, 0] } },
  { id: 'kb-x-hyper', base: 'kettlebell-swing', when: 'end', delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },

  { id: 'crunch-x-neck', base: 'crunch', delta: { Neck: [24, 0, 0], Head: [18, 0, 0] } },
  { id: 'crunch-x-situp', base: 'crunch', delta: { Spine: [28, 0, 0], Spine1: [16, 0, 0] } },
  { id: 'crunch-x-yank', base: 'crunch', rush: true },
  { id: 'crunch-x-breath', base: 'crunch', delta: { LeftShoulder: [10, 0, -12], Neck: [6, 0, 0] } },

  {
    id: 'llr-x-arch',
    base: 'lying-leg-raise',
    when: 'all',
    delta: { Spine: [-16, 0, 0], LeftUpLeg: [-14, 0, 0] },
    hipsRot: [14, 0, 0],
    hips: [0, 2, 0],
  },
  { id: 'llr-x-swing', base: 'lying-leg-raise', delta: { LeftUpLeg: [-18, 0, 0] }, rush: true },
  { id: 'llr-x-drop', base: 'lying-leg-raise', rush: true, delta: { LeftLeg: [10, 0, 0] } },
  { id: 'llr-x-breath', base: 'lying-leg-raise', delta: { LeftShoulder: [10, 0, -10], Neck: [6, 0, 0] } },

  {
    id: 'rt-x-arms',
    base: 'russian-twist',
    when: 'all',
    // 胸椎不转，只有双臂绕身体中轴甩向一侧约 35°
    edit: (pose) => {
      const toLeft = pose.rot.Spine[1] > 0
      const unturned = (name: string): EulerDeg => [pose.rot[name][0], 0, 0]
      pose.rot = {
        ...pose.rot,
        Spine: unturned('Spine'),
        Spine1: unturned('Spine1'),
        Spine2: unturned('Spine2'),
        LeftArm: toLeft ? [-59, 22, -78] : [-57, -18, -137],
        RightArm: toLeft ? [-57, 18, 137] : [-59, -22, 78],
      }
    },
  },
  { id: 'rt-x-round', base: 'russian-twist', when: 'all', delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0] } },
  { id: 'rt-x-fast', base: 'russian-twist', rush: true },
  {
    id: 'rt-x-neck',
    base: 'russian-twist',
    when: 'all',
    // 头比胸转得更多，用脖子带动
    edit: (pose) => {
      const side = Math.sign(pose.rot.Spine[1])
      pose.rot = { ...pose.rot, Neck: [pose.rot.Neck?.[0] ?? 0, 28 * side, 0], Head: [0, 14 * side, 0] }
    },
  },
]

export const FAULT_MOTIONS: Record<string, MotionDef> = Object.fromEntries(SPECS.map((spec) => [spec.id, buildSpec(spec)]))

function errors(labels: string[], ids: string[]): ErrorVariant[] {
  return labels.map((label, i) => ({ label, motionId: ids[i] }))
}

/** 每个动作的常见错误都有一条可播放的变体。标签与 exercises.mistakes 逐字对应。 */
export const exerciseFaults: Record<string, { base: string; errors: ErrorVariant[] }> = {
  squat: {
    base: 'squat',
    errors: errors(
      ['膝盖内扣（膝外翻）', '脚跟离地、重心前移', '弓腰驼背，腰椎受压', '下蹲深度不足'],
      ['squat-x-valgus', 'squat-x-heels', 'squat-x-round', 'squat-x-shallow'],
    ),
  },
  'air-squat': {
    base: 'squat',
    errors: errors(
      ['膝盖内扣', '脚跟离地、重心前移', '含胸弓背', '只屈膝不屈髋，膝盖过度前移'],
      ['squat-x-valgus', 'squat-x-heels', 'squat-x-round', 'squat-x-knees'],
    ),
  },
  'overhead-squat': {
    base: 'overhead-squat',
    errors: errors(
      ['手臂弯曲或杠铃前移', '肩灵活性不足导致躯干过度前倾', '核心松弛、腰部代偿', '重量过大牺牲动作幅度'],
      ['ohs-x-bend', 'ohs-x-lean', 'ohs-x-loose', 'ohs-x-shallow'],
    ),
  },
  'push-up': {
    base: 'push-up',
    errors: errors(
      ['塌腰或撅臀', '肘部过度外展呈 90°', '动作幅度不足、只做半程', '颈部前伸'],
      ['push-up-x-sag', 'push-up-x-flare', 'push-up-x-half', 'push-up-x-neck'],
    ),
  },
  'jump-push-up': {
    base: 'jump-push-up',
    errors: errors(
      ['塌腰或撅臀完成跳跃', '落地时肘部锁死冲击关节', '靠甩腰而非上肢爆发力', '腕关节未热身直接训练'],
      ['jpu-x-sag', 'jpu-x-lock', 'jpu-x-whip', 'jpu-x-wrist'],
    ),
  },
  deadlift: {
    base: 'deadlift',
    errors: errors(
      ['弓背拉起（腰椎代偿）', '杠铃离身体过远', '先抬臀导致姿势变形', '锁定时刻意后仰'],
      ['deadlift-x-arch', 'deadlift-x-far', 'deadlift-x-hips', 'deadlift-x-hyper'],
    ),
  },
  plank: {
    base: 'plank',
    errors: errors(
      ['腰部下沉塌陷', '臀部抬得过高', '憋气硬撑', '肘部位置过前或过后'],
      ['plank-x-sag', 'plank-x-pike', 'plank-x-breath', 'plank-x-elbow'],
    ),
  },
  lunge: {
    base: 'lunge',
    errors: errors(
      ['前膝内扣', '步幅过小导致膝压过大', '躯干前倾过多', '后脚不稳、身体晃动'],
      ['lunge-x-valgus', 'lunge-x-short', 'lunge-x-lean', 'lunge-x-wobble'],
    ),
  },
  'bicep-curl': {
    base: 'bicep-curl',
    errors: errors(
      ['甩动身体借力', '肘部前后移动', '下放过快失去张力', '手腕过度弯曲'],
      ['bicep-curl-x-swing', 'bicep-x-elbow', 'bicep-x-drop', 'bicep-x-wrist'],
    ),
  },
  'sit-up': {
    base: 'sit-up',
    errors: errors(
      ['双手抱头猛拉颈部', '借助惯性弹起', '腰部悬空弓起', '下放时完全放松砸地'],
      ['sit-up-x-neck', 'sit-up-x-yank', 'sit-up-x-arch', 'sit-up-x-slam'],
    ),
  },
  'jumping-jack': {
    base: 'jumping-jack',
    errors: errors(
      ['落地时膝盖完全锁死', '动作松散、手脚不同步', '全脚掌重落地冲击关节', '速度忽快忽慢'],
      ['jj-x-lock', 'jj-x-loose', 'jj-x-flat', 'jj-x-rush'],
    ),
  },
  'bench-press': {
    base: 'bench-press',
    errors: errors(
      ['手腕过度后翻受压', '肘部完全外展 90°', '杠铃下放位置过高（砸向脖子）', '臀部离凳借力'],
      ['bench-x-wrist', 'bench-press-x-flare', 'bench-x-high', 'bench-x-bridge'],
    ),
  },
  'pull-up': {
    base: 'pull-up',
    errors: errors(
      ['甩腰摆腿借力（非刻意蝶式）', '下放不完全、只做半程', '耸肩缩脖、肩胛未启动', '握距过宽限制幅度'],
      ['pull-up-x-kip', 'pull-up-x-half', 'pull-up-x-shrug', 'pull-up-x-wide'],
    ),
  },
  'overhead-press': {
    base: 'overhead-press',
    errors: errors(
      ['过度挺腰借力（腰椎受压）', '推起时杠铃前移绕头', '握距过窄或过宽', '锁定时刻意耸肩'],
      ['ohp-x-lean', 'ohp-x-forward', 'ohp-x-grip', 'ohp-x-shrug'],
    ),
  },
  burpee: {
    base: 'burpee',
    errors: errors(
      ['平板撑时塌腰', '落地时膝盖锁死无缓冲', '节奏忽快忽慢、动作没做到位', '为追求高度牺牲姿势'],
      ['burpee-x-sag', 'burpee-x-lock', 'burpee-x-rush', 'burpee-x-sloppy'],
    ),
  },
  'romanian-deadlift': {
    base: 'romanian-deadlift',
    errors: errors(
      ['变成深蹲、膝盖弯曲过多', '弓背追求下放深度', '杠铃离开腿部', '站直时腰部过度后仰'],
      ['rdl-x-squat', 'rdl-x-round', 'rdl-x-far', 'rdl-x-hyper'],
    ),
  },
  'good-morning': {
    base: 'good-morning',
    errors: errors(
      ['弓背低头', '膝盖弯曲过多做成深蹲', '重量压在颈椎上', '幅度过大导致腰椎失稳'],
      ['good-morning-x-arch', 'gm-x-squat', 'gm-x-neck', 'gm-x-deep'],
    ),
  },
  'bent-over-row': {
    base: 'bent-over-row',
    errors: errors(
      ['用甩腰惯性拉起', '躯干起起伏伏', '肘部过度外展', '含胸圆背'],
      ['row-x-yank', 'row-x-bounce', 'row-x-flare', 'row-x-round'],
    ),
  },
  'rear-delt-fly': {
    base: 'rear-delt-fly',
    errors: errors(
      ['重量过大变成划船', '耸肩代偿', '躯干跟着甩动', '手臂完全伸直锁死肘关节'],
      ['rdf-x-row', 'rdf-x-shrug', 'rdf-x-swing', 'rdf-x-lock'],
    ),
  },
  'lateral-raise': {
    base: 'lateral-raise',
    errors: errors(
      ['甩动身体借力', '抬过头顶变成斜方肌发力', '手腕高于肘部', '下放时完全放松'],
      ['lat-x-swing', 'lat-x-high', 'lat-x-wrist', 'lat-x-drop'],
    ),
  },
  'front-raise': {
    base: 'front-raise',
    errors: errors(
      ['身体前后晃动', '抬得过高超过肩', '腰部过度后仰', '肘部完全锁死'],
      ['front-x-sway', 'front-x-high', 'front-x-hyper', 'front-x-lock'],
    ),
  },
  'tricep-extension': {
    base: 'tricep-extension',
    errors: errors(
      ['大臂前后晃动借力', '肘部向外打开', '下放幅度不够', '用腰部后仰完成上举'],
      ['tri-x-swing', 'tri-x-flare', 'tri-x-short', 'tri-x-lean'],
    ),
  },
  'calf-raise': {
    base: 'calf-raise',
    errors: errors(
      ['身体前倾用体重晃起来', '幅度只有一半', '膝盖大幅弯曲', '速度太快没有顶峰收缩'],
      ['calf-x-lean', 'calf-x-half', 'calf-x-bend', 'calf-x-bounce'],
    ),
  },
  'jump-squat': {
    base: 'jump-squat',
    errors: errors(
      ['落地膝盖内扣', '只跳不高蹲', '落地时膝盖锁死', '含胸弓背起跳'],
      ['js-x-valgus', 'js-x-shallow', 'js-x-lock', 'js-x-round'],
    ),
  },
  'high-knees': {
    base: 'high-knees',
    errors: errors(
      ['身体后仰', '脚掌重砸地面', '抬腿只靠小腿折叠', '含胸塌腰'],
      ['hk-x-lean', 'hk-x-stomp', 'hk-x-fold', 'hk-x-slump'],
    ),
  },
  thruster: {
    base: 'thruster',
    errors: errors(
      ['下蹲时严重前倾', '只用手臂硬推、腿部没有发力', '推起时腰部过度后仰', '哑铃在肩上失去控制'],
      ['th-x-lean', 'th-x-press', 'th-x-hyper', 'th-x-loose'],
    ),
  },
  'kettlebell-swing': {
    base: 'kettlebell-swing',
    errors: errors(
      ['做成深蹲', '用手臂把壶铃举起来', '弓背下摆', '顶端身体过度后仰'],
      ['kb-x-squat', 'kb-x-arm', 'kb-x-round', 'kb-x-hyper'],
    ),
  },
  crunch: {
    base: 'crunch',
    errors: errors(
      ['双手抱头拉脖子', '做成完整仰卧起坐', '用惯性弹起', '憋气'],
      ['crunch-x-neck', 'crunch-x-situp', 'crunch-x-yank', 'crunch-x-breath'],
    ),
  },
  'lying-leg-raise': {
    base: 'lying-leg-raise',
    errors: errors(
      ['下背拱起离开地面', '用甩腿惯性', '下放时脚跟砸地', '憋气'],
      ['llr-x-arch', 'llr-x-swing', 'llr-x-drop', 'llr-x-breath'],
    ),
  },
  'russian-twist': {
    base: 'russian-twist',
    errors: errors(
      ['只甩手臂、胸椎不动', '塌腰圆背', '速度过快失去控制', '用脖子带动转向'],
      ['rt-x-arms', 'rt-x-round', 'rt-x-fast', 'rt-x-neck'],
    ),
  },
}
