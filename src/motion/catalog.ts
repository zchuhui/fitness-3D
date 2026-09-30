import { FAULT_MOTIONS } from './faults'
import { MOTIONS, type MotionDef } from './motions'

/** 标准动作 + 错误变体的统一入口 */
export function getMotion(id: string): MotionDef | undefined {
  return MOTIONS[id] ?? FAULT_MOTIONS[id]
}

/** 仰卧 / 俯卧（髋部放倒）用低机位。引体向上是双手悬挂，不算贴地。 */
export function isFloorMotion(id: string) {
  const motion = getMotion(id)
  if (!motion) return false
  return motion.poses.some((pose) => !!pose.hipsRot && Math.abs(pose.hipsRot[0]) >= 45)
}
