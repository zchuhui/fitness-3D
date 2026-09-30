import type { MuscleGroup } from '../types'

/** 身体分区。头不参与肌群高亮，只在透视里保留肤色。 */
export type BodyRegion = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'head'

/** 教练人偶 / 解剖透视 / 力学轨迹 */
export type LookMode = 'coach' | 'anatomy' | 'mechanics'

export const LOOK_MODES: { id: LookMode; label: string }[] = [
  { id: 'coach', label: '教练' },
  { id: 'anatomy', label: '透视' },
  { id: 'mechanics', label: '力学' },
]

/** 动作的目标肌群对应哪些分区要呼吸高亮 */
export const MUSCLE_REGIONS: Record<MuscleGroup, BodyRegion[]> = {
  胸部: ['chest'],
  背部: ['back'],
  腿部: ['legs'],
  肩部: ['shoulders'],
  手臂: ['arms'],
  核心: ['core'],
  全身: ['chest', 'back', 'shoulders', 'arms', 'core', 'legs'],
}

/** Mixamo 脊柱骨靠后，骨局部 -Z 是胸腹正面（由 X Bot 蒙皮统计得出） */
const FRONT_IS_NEG_Z = true

export function shortBone(name: string) {
  return name.replace(/^mixamorig:?/, '')
}

/**
 * 主导骨骼 + 相对该骨的局部 Z，决定顶点属于哪一块肌群。
 * 四肢按骨骼名；躯干按正/背面拆成胸、核心、背。
 */
export function regionForBone(boneName: string, localZ: number): BodyRegion {
  const n = shortBone(boneName)
  if (/Shoulder/.test(n)) return 'shoulders'
  if (/Neck/.test(n)) return 'shoulders'
  if (/Hand|Thumb|Index|Middle|Ring|Pinky|ForeArm/.test(n) || /(?:^|:)Arm$/.test(n) || /Arm$/.test(n)) {
    return 'arms'
  }
  if (/UpLeg|Leg$|Foot|Toe/.test(n)) return 'legs'
  if (/Head|Eye/.test(n)) return 'head'
  const front = FRONT_IS_NEG_Z ? localZ < 0 : localZ > 0
  if (/Spine2/.test(n)) return front ? 'chest' : 'back'
  if (/Spine1|^Spine$|Hips/.test(n)) return front ? 'core' : 'back'
  return 'core'
}

export function regionFromMeshName(name: string): BodyRegion | null {
  const m = /^region_(chest|back|shoulders|arms|core|legs|head)$/.exec(name)
  return m ? (m[1] as BodyRegion) : null
}
