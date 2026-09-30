/**
 * 标准动作的关键姿势。角度是 X Bot（Mixamo 骨骼）局部欧拉角，单位：度，顺序 XYZ。
 * 只写左侧时，右侧会按镜像自动补上。
 * plant:
 *   feet  — 双脚着地（一脚抬起时钉住支撑脚）
 *   toes  — 脚尖着地，用于提踵
 *   hands — 双手固定在空中，身体上下移动（引体向上）
 *   none  — 使用姿势里写好的髋部位置（仰卧类）
 */

export type EulerDeg = [number, number, number]

export interface MotionPose {
  /** 秒 */
  t: number
  rot: Record<string, EulerDeg>
  /** 离地高度（米），加在着地解算之后，用于跳跃 */
  hop?: number
  /** 髋部局部坐标，仅 plant = none 时使用 */
  hips?: [number, number, number]
  hipsRot?: EulerDeg
}

export interface MotionDef {
  duration: number
  plant: 'feet' | 'toes' | 'hands' | 'none'
  poses: MotionPose[]
}

const mirror = (e: EulerDeg): EulerDeg => [e[0], -e[1], -e[2]]

/** 补全右侧肢体。已手写的右侧不会被覆盖。 */
export function both(partial: Record<string, EulerDeg>): Record<string, EulerDeg> {
  const rot: Record<string, EulerDeg> = {}
  for (const [name, e] of Object.entries(partial)) {
    rot[name] = e
    if (name.startsWith('Left')) {
      const right = 'Right' + name.slice(4)
      if (!Object.prototype.hasOwnProperty.call(partial, right)) rot[right] = mirror(e)
    }
  }
  return rot
}

const merge = (...parts: Record<string, EulerDeg>[]) => Object.assign({}, ...parts)

const pose = (
  t: number,
  rot: Record<string, EulerDeg>,
  extra?: Omit<MotionPose, 't' | 'rot'>,
): MotionPose => ({ t, rot, ...extra })

/** 解剖站姿：手臂垂于体侧，膝关节微屈 */
const STAND = both({
  LeftArm: [14, 8, -73],
  LeftForeArm: [0, -14, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [5, 0, 0],
  Spine: [2, 0, 0],
})

const SQUAT = both({
  LeftUpLeg: [-86, 8, 12],
  LeftLeg: [112, 0, 0],
  LeftFoot: [-24, 0, 0],
  Spine: [26, 0, 0],
  Spine1: [8, 0, 0],
  LeftArm: [52, 22, -52],
  LeftForeArm: [0, -52, 0],
})

const HINGE = both({
  LeftUpLeg: [-70, 2, 4],
  LeftLeg: [18, 0, 0],
  LeftFoot: [-8, 0, 0],
  Spine: [50, 0, 0],
  Spine1: [16, 0, 0],
  LeftArm: [10, 4, -78],
  LeftForeArm: [0, -8, 0],
})

const DEADLIFT_BOTTOM = both({
  LeftUpLeg: [-76, 4, 6],
  LeftLeg: [52, 0, 0],
  LeftFoot: [-14, 0, 0],
  Spine: [38, 0, 0],
  Spine1: [16, 0, 0],
  LeftArm: [16, 4, -78],
  LeftForeArm: [0, -8, 0],
})

const RACK = both({
  LeftArm: [-40, 0, -80],
  LeftForeArm: [0, -48, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [5, 0, 0],
  Spine: [4, 0, 0],
})

const OVERHEAD = both({
  LeftArm: [60, 100, 40],
  LeftForeArm: [0, -12, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [4, 0, 0],
  Spine: [4, 0, 0],
})

const TUCK = both({
  LeftUpLeg: [-16, 4, 4],
  LeftLeg: [70, 0, 0],
  LeftFoot: [-12, 0, 0],
})

/** 仰卧，背靠近地面，膝弯曲 */
const FLOOR: Pick<MotionPose, 'hips' | 'hipsRot'> = {
  hips: [0, 8, 6],
  hipsRot: [-90, 0, 0],
}

const SUPINE_LEGS = both({
  LeftUpLeg: [-32, 10, 6],
  LeftLeg: [74, 0, 0],
  LeftFoot: [6, 0, 0],
})

const LUNGE_LEFT = {
  LeftUpLeg: [-80, 4, 6],
  RightUpLeg: [-10, -4, -6],
  LeftLeg: [100, 0, 0],
  RightLeg: [90, 0, 0],
  LeftFoot: [-4, 0, 0],
  RightFoot: [12, 0, 0],
  Spine: [8, 0, 0],
  Spine1: [4, 0, 0],
  LeftArm: [16, 6, -68],
  RightArm: [16, -6, 68],
  LeftForeArm: [0, -16, 0],
  RightForeArm: [0, 16, 0],
} satisfies Record<string, EulerDeg>

const LUNGE_RIGHT: Record<string, EulerDeg> = {
  RightUpLeg: [-80, -4, -6],
  LeftUpLeg: [-10, 4, 6],
  RightLeg: [100, 0, 0],
  LeftLeg: [90, 0, 0],
  RightFoot: [-4, 0, 0],
  LeftFoot: [12, 0, 0],
  Spine: [8, 0, 0],
  Spine1: [4, 0, 0],
  RightArm: [16, -6, 68],
  LeftArm: [16, 6, -68],
  RightForeArm: [0, 16, 0],
  LeftForeArm: [0, -16, 0],
}

const HIGH_KNEE_LEFT = {
  LeftUpLeg: [-92, 6, 6],
  LeftLeg: [100, 0, 0],
  RightUpLeg: [4, -2, -3],
  RightLeg: [12, 0, 0],
  LeftFoot: [-8, 0, 0],
  Spine: [6, 0, 0],
  LeftArm: [24, 12, -58],
  RightArm: [-78, 12, 70],
  LeftForeArm: [0, -20, 0],
  RightForeArm: [0, 18, 0],
} satisfies Record<string, EulerDeg>

const HIGH_KNEE_RIGHT: Record<string, EulerDeg> = {
  RightUpLeg: [-92, -6, -6],
  RightLeg: [100, 0, 0],
  LeftUpLeg: [4, 2, 3],
  LeftLeg: [12, 0, 0],
  RightFoot: [-8, 0, 0],
  Spine: [6, 0, 0],
  RightArm: [24, -12, 58],
  LeftArm: [-78, -12, -70],
  RightForeArm: [0, 20, 0],
  LeftForeArm: [0, -18, 0],
}

export const MOTIONS: Record<string, MotionDef> = {
  deadlift: {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(1.05, DEADLIFT_BOTTOM),
      pose(1.4, DEADLIFT_BOTTOM),
      pose(2.6, STAND),
    ],
  },
  'romanian-deadlift': {
    duration: 2.6,
    plant: 'feet',
    poses: [pose(0, STAND), pose(1.1, HINGE), pose(1.45, HINGE), pose(2.6, STAND)],
  },
  lunge: {
    duration: 3.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.7, LUNGE_LEFT),
      pose(1.05, LUNGE_LEFT),
      pose(1.6, STAND),
      pose(2.3, LUNGE_RIGHT),
      pose(2.65, LUNGE_RIGHT),
      pose(3.2, STAND),
    ],
  },
  'bicep-curl': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftForeArm: [0, -142, 0] }))),
      pose(1.15, merge(STAND, both({ LeftForeArm: [0, -142, 0] }))),
      pose(2.2, STAND),
    ],
  },
  'overhead-press': {
    duration: 2.4,
    plant: 'feet',
    poses: [pose(0, RACK), pose(0.9, OVERHEAD), pose(1.25, OVERHEAD), pose(2.4, RACK)],
  },
  'lateral-raise': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftArm: [0, 0, -12], LeftForeArm: [0, -8, 0] }))),
      pose(1.15, merge(STAND, both({ LeftArm: [0, 0, -12], LeftForeArm: [0, -8, 0] }))),
      pose(2.2, STAND),
    ],
  },
  'front-raise': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftArm: [-80, -16, -78], LeftForeArm: [0, -10, 0] }))),
      pose(1.15, merge(STAND, both({ LeftArm: [-80, -16, -78], LeftForeArm: [0, -10, 0] }))),
      pose(2.2, STAND),
    ],
  },
  'bent-over-row': {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, merge(HINGE, both({ LeftArm: [28, 12, -70], LeftForeArm: [0, -16, 0] }))),
      pose(0.85, merge(HINGE, both({ LeftArm: [-42, 24, -36], LeftForeArm: [0, -98, 0] }))),
      pose(1.2, merge(HINGE, both({ LeftArm: [-42, 24, -36], LeftForeArm: [0, -98, 0] }))),
      pose(2.4, merge(HINGE, both({ LeftArm: [28, 12, -70], LeftForeArm: [0, -16, 0] }))),
    ],
  },
  'rear-delt-fly': {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, merge(HINGE, both({ LeftArm: [20, 8, -70], LeftForeArm: [0, -12, 0] }))),
      pose(0.85, merge(HINGE, both({ LeftArm: [-10, 8, -8], LeftForeArm: [0, -14, 0] }))),
      pose(1.2, merge(HINGE, both({ LeftArm: [-10, 8, -8], LeftForeArm: [0, -14, 0] }))),
      pose(2.4, merge(HINGE, both({ LeftArm: [20, 8, -70], LeftForeArm: [0, -12, 0] }))),
    ],
  },
  'calf-raise': {
    duration: 2,
    plant: 'toes',
    poses: [
      pose(0, STAND),
      pose(0.7, merge(STAND, both({ LeftLeg: [2, 0, 0], LeftFoot: [52, 0, 0] }))),
      pose(1.1, merge(STAND, both({ LeftLeg: [2, 0, 0], LeftFoot: [52, 0, 0] }))),
      pose(2, STAND),
    ],
  },
  'high-knees': {
    duration: 1.2,
    plant: 'feet',
    poses: [
      pose(0, HIGH_KNEE_LEFT),
      pose(0.6, HIGH_KNEE_RIGHT),
      pose(1.2, HIGH_KNEE_LEFT),
    ],
  },
  'good-morning': {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
      pose(
        1.1,
        merge(HINGE, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0], LeftUpLeg: [-62, 2, 3], LeftLeg: [14, 0, 0] })),
      ),
      pose(
        1.45,
        merge(HINGE, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0], LeftUpLeg: [-62, 2, 3], LeftLeg: [14, 0, 0] })),
      ),
      pose(2.6, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
    ],
  },
  'jump-squat': {
    duration: 2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.7, SQUAT),
      pose(1.05, { ...OVERHEAD, Spine: [2, 0, 0] }, { hop: 0.2 }),
      pose(1.4, STAND),
      pose(2, STAND),
    ],
  },
  burpee: {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(
        0.7,
        both({
          LeftUpLeg: [-98, 6, 10],
          LeftLeg: [118, 0, 0],
          LeftFoot: [-18, 0, 0],
          Spine: [46, 0, 0],
          Spine1: [20, 0, 0],
          LeftArm: [-20, -40, -80],
          LeftForeArm: [0, -16, 0],
        }),
      ),
      pose(0.95, both({
        LeftUpLeg: [-98, 6, 10],
        LeftLeg: [118, 0, 0],
        LeftFoot: [-18, 0, 0],
        Spine: [46, 0, 0],
        Spine1: [20, 0, 0],
        LeftArm: [-20, -40, -80],
        LeftForeArm: [0, -16, 0],
      })),
      pose(1.3, OVERHEAD, { hop: 0.24 }),
      pose(1.7, STAND),
      pose(2.4, STAND),
    ],
  },
  thruster: {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, RACK),
      pose(0.9, merge(SQUAT, both({ LeftArm: [-40, 0, -80], LeftForeArm: [0, -48, 0] }))),
      pose(1.45, OVERHEAD),
      pose(1.8, OVERHEAD),
      pose(2.6, RACK),
    ],
  },
  'kettlebell-swing': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(0.7, HINGE),
      pose(1.15, merge(STAND, both({ LeftArm: [-78, -12, -76], LeftForeArm: [0, -12, 0], Spine: [-4, 0, 0] }))),
      pose(1.4, merge(STAND, both({ LeftArm: [-78, -12, -76], LeftForeArm: [0, -12, 0] }))),
      pose(2.2, STAND),
    ],
  },
  'tricep-extension': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, OVERHEAD),
      pose(0.8, merge(OVERHEAD, both({ LeftForeArm: [0, -130, 0] }))),
      pose(1.15, merge(OVERHEAD, both({ LeftForeArm: [0, -130, 0] }))),
      pose(2.2, OVERHEAD),
    ],
  },
  'pull-up': {
    duration: 2.2,
    plant: 'hands',
    poses: [
      pose(0, merge(TUCK, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], Spine: [10, 0, 0] }))),
      pose(0.8, merge(TUCK, both({ LeftArm: [-40, 0, 60], LeftForeArm: [0, -92, 0], Spine: [-14, 0, 0] }))),
      pose(1.15, merge(TUCK, both({ LeftArm: [-40, 0, 60], LeftForeArm: [0, -92, 0], Spine: [-14, 0, 0] }))),
      pose(2.2, merge(TUCK, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], Spine: [10, 0, 0] }))),
    ],
  },
  'sit-up': {
    duration: 2.4,
    plant: 'none',
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })), FLOOR),
      pose(
        0.9,
        merge(SUPINE_LEGS, both({ Spine: [58, 0, 0], Spine1: [32, 0, 0], Spine2: [16, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })),
        FLOOR,
      ),
      pose(
        1.25,
        merge(SUPINE_LEGS, both({ Spine: [58, 0, 0], Spine1: [32, 0, 0], Spine2: [16, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })),
        FLOOR,
      ),
      pose(2.4, merge(SUPINE_LEGS, both({ LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })), FLOOR),
    ],
  },
  crunch: {
    duration: 2,
    plant: 'none',
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })), FLOOR),
      pose(
        0.7,
        merge(SUPINE_LEGS, both({ Spine: [34, 0, 0], Spine1: [20, 0, 0], Spine2: [10, 0, 0], LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })),
        FLOOR,
      ),
      pose(
        1.05,
        merge(SUPINE_LEGS, both({ Spine: [34, 0, 0], Spine1: [20, 0, 0], Spine2: [10, 0, 0], LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })),
        FLOOR,
      ),
      pose(2, merge(SUPINE_LEGS, both({ LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })), FLOOR),
    ],
  },
  'lying-leg-raise': {
    duration: 2.4,
    plant: 'none',
    poses: [
      pose(0, both({ LeftUpLeg: [0, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(0.9, both({ LeftUpLeg: [-102, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(1.25, both({ LeftUpLeg: [-102, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(2.4, both({ LeftUpLeg: [0, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
    ],
  },
  'bench-press': {
    duration: 2.4,
    plant: 'none',
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR),
      pose(0.85, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), FLOOR),
      pose(1.2, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), FLOOR),
      pose(2.4, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR),
    ],
  },
  'russian-twist': {
    duration: 2,
    plant: 'none',
    poses: [
      pose(
        0,
        merge(SUPINE_LEGS, both({ Spine: [42, -20, 0], Spine1: [12, -8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR,
      ),
      pose(
        1,
        merge(SUPINE_LEGS, both({ Spine: [42, 20, 0], Spine1: [12, 8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR,
      ),
      pose(
        2,
        merge(SUPINE_LEGS, both({ Spine: [42, -20, 0], Spine1: [12, -8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR,
      ),
    ],
  },
}
