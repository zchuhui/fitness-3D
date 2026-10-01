import { Euler, MathUtils, Vector3 } from 'three'
import { FAULT_MOTIONS } from './faults'
import { MOTIONS, type MotionDef } from './motions'

/** 标准动作 + 错误变体的统一入口 */
export function getMotion(id: string): MotionDef | undefined {
  return MOTIONS[id] ?? FAULT_MOTIONS[id]
}

const FLOOR_TILT = Math.cos(MathUtils.degToRad(40))

/**
 * 大部分时间仰卧 / 俯卧 / 侧卧（髋部放倒）的动作用低机位。引体向上是双手悬挂，不算贴地；
 * 波比跳只在中段落地，大部分时间站立，也不算。
 */
export function isFloorMotion(id: string) {
  const motion = getMotion(id)
  if (!motion) return false
  const up = new Vector3()
  const lying = motion.poses.map((pose) => {
    if (!pose.hipsRot) return false
    const [x, y, z] = pose.hipsRot.map(MathUtils.degToRad)
    return up.set(0, 1, 0).applyEuler(new Euler(x, y, z, 'XYZ')).y < FLOOR_TILT
  })
  if (motion.poses.length === 1) return lying[0]
  let time = 0
  for (let i = 1; i < motion.poses.length; i++) {
    if (lying[i - 1] && lying[i]) time += motion.poses[i].t - motion.poses[i - 1].t
  }
  return time * 2 > motion.poses[motion.poses.length - 1].t - motion.poses[0].t
}
