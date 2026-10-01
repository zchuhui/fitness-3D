/**
 * 标准动作的关键姿势。角度是 X Bot（Mixamo 骨骼）局部欧拉角，单位：度，顺序 XYZ。
 * 只写左侧时，右侧会按镜像自动补上。
 * plant:
 *   feet  — 双脚着地（一脚抬起时钉住支撑脚）
 *   toes  — 前脚掌着地，用于提踵；波比跳也用它，站姿和平板撑都能落地
 *   hands — 双手固定。手在髋下方（俯撑）时双手贴地，身体绕手转到撑地脚尖着地；
 *           手在髋上方时双手钉在空中（引体向上）
 *   none  — 使用姿势里写好的髋部位置（仰卧类）
 */

export type EulerDeg = [number, number, number]

export interface MotionPose {
  /** 秒 */
  t: number
  rot: Record<string, EulerDeg>
  /** 离地高度（米），加在着地解算之后，用于跳跃。俯撑时表现为双手离地、身体绕脚尖转 */
  hop?: number
  /** 着地解算后的整体平移（米）。双脚换位而双手不动时用来把身体挪回去（波比跳后跳成平板） */
  shift?: [number, number, number]
  /** 髋部局部坐标，仅 plant = none 时使用 */
  hips?: [number, number, number]
  hipsRot?: EulerDeg
}

/**
 * 一段过渡的节奏。tempo > 1 离心（慢到位），< 1 向心（快到位），1 为 smoothstep。
 * hold 是段末停住的比例（0–0.45），停住期间姿势保持在终点。
 */
export interface MotionSegment {
  tempo?: number
  hold?: number
}

export interface MotionDef {
  duration: number
  plant: 'feet' | 'toes' | 'hands' | 'none'
  poses: MotionPose[]
  /** 与 poses 之间的间隔一一对应，长度应为 poses.length - 1 */
  segments?: MotionSegment[]
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

/** 左右整体镜像（左右骨骼互换），用于不对称的单侧动作 */
function swapSides(rot: Record<string, EulerDeg>): Record<string, EulerDeg> {
  const out: Record<string, EulerDeg> = {}
  for (const [name, e] of Object.entries(rot)) {
    const other = name.startsWith('Left') ? 'Right' + name.slice(4) : name.startsWith('Right') ? 'Left' + name.slice(5) : name
    out[other] = mirror(e)
  }
  return out
}
const swapPlace = (p: Pick<MotionPose, 'hips' | 'hipsRot'>): Pick<MotionPose, 'hips' | 'hipsRot'> => ({
  hips: p.hips && [-p.hips[0], p.hips[1], p.hips[2]],
  hipsRot: p.hipsRot && mirror(p.hipsRot),
})

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

/** 壶铃后摆：髋后坐、膝微屈、背中立，双手并拢伸到大腿之间 */
const KB_HIKE = both({
  LeftUpLeg: [-56, 8, 10],
  LeftLeg: [34, 0, 0],
  LeftFoot: [-10, 0, 0],
  Spine: [20, 0, 0],
  Spine1: [6, 0, 0],
  LeftArm: [8, 0, -96],
  LeftForeArm: [0, -6, 0],
})

/** 壶铃顶端：站直、臀腿夹紧，手臂当挂钩摆到胸前，不弯肘、不后仰 */
const KB_TOP = both({
  LeftUpLeg: [-2, 0, 2],
  LeftLeg: [6, 0, 0],
  Spine: [2, 0, 0],
  LeftArm: [-72, 0, -96],
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

// 跳跃：蹬伸 / 腾空 / 触地 / 缓冲。踝跖屈时脚踝要抬高才能让前脚掌刚好着地
const JUMP_EXTEND = both({
  LeftUpLeg: [-4, 0, 3],
  LeftLeg: [4, 0, 0],
  LeftFoot: [32, 0, 0],
  Spine: [4, 0, 0],
  LeftArm: [-80, -16, -78],
  LeftForeArm: [0, -10, 0],
})
const JUMP_AIR = both({
  LeftUpLeg: [-4, 0, 3],
  LeftLeg: [4, 0, 0],
  LeftFoot: [32, 0, 0],
  Spine: [2, 0, 0],
  LeftArm: [60, 100, 40],
  LeftForeArm: [0, -12, 0],
})
const JUMP_TOUCH = both({
  LeftUpLeg: [-14, 0, 4],
  LeftLeg: [18, 0, 0],
  LeftFoot: [22, 0, 0],
  Spine: [6, 0, 0],
  LeftArm: [-80, -16, -78],
  LeftForeArm: [0, -10, 0],
})
/** 落地缓冲：半蹲、臀部后坐、膝对脚尖，手臂前伸保持平衡 */
const JUMP_LAND = both({
  LeftUpLeg: [-58, 6, 7],
  LeftLeg: [76, 0, 0],
  LeftFoot: [-16, 0, 0],
  Spine: [18, 0, 0],
  Spine1: [6, 0, 0],
  LeftArm: [-40, -6, -78],
  LeftForeArm: [0, -20, 0],
})
/** 波比跳下蹲撑地：屈膝约 50°、髋与膝同高，背部中立前倾，双手掌心贴地撑在脚尖前方 */
const BURPEE_SQUAT = both({
  LeftUpLeg: [-140, 0, 0],
  LeftLeg: [124, 0, 0],
  LeftFoot: [-37, 0, 0],
  LeftArm: [-85, -48, -81],
  LeftForeArm: [0, -4, 0],
  LeftHand: [42, 1, 81],
  Spine: [16, 0, 0],
  Spine1: [20, 0, 0],
  Head: [-37, 0, 0],
})
const BURPEE_SQUAT_AT: Omit<MotionPose, 't' | 'rot'> = { hipsRot: [52, 0, 0] }
/** 后跳成平板（同俯卧撑顶端）：整体后移，让双手停在下蹲时撑地的位置 */
const BURPEE_PLANK_AT: Omit<MotionPose, 't' | 'rot'> = { hipsRot: [69.6, 0, 0], shift: [0, 0, -1.063] }
/** 后跳 / 收腿途中：双手不动，腿半伸 */
const BURPEE_KICK = both({
  LeftUpLeg: [-71, 1, 1],
  LeftLeg: [63, 0, 0],
  LeftFoot: [-30, 0, 0],
  LeftToeBase: [-45, 0, 0],
  LeftArm: [-78, -41, -80],
  LeftForeArm: [0, -4, 0],
  LeftHand: [44, -2, 83],
  Spine: [12, 0, 0],
  Spine1: [10, 0, 0],
  Head: [-21, 0, 0],
})
const BURPEE_KICK_AT: Omit<MotionPose, 't' | 'rot'> = { hipsRot: [85.4, 0, 0], shift: [0, 0, -0.604] }
/** 刚蹬离 / 刚收回：臀部略抬高，双手仍不动 */
const BURPEE_TUCK = both({
  LeftUpLeg: [-106, 1, 1],
  LeftLeg: [94, 0, 0],
  LeftFoot: [-34, 0, 0],
  LeftToeBase: [-45, 0, 0],
  LeftArm: [-82, -45, -81],
  LeftForeArm: [0, -4, 0],
  LeftHand: [43, -1, 82],
  Spine: [14, 0, 0],
  Spine1: [15, 0, 0],
  Head: [-29, 0, 0],
})
const BURPEE_TUCK_AT: Omit<MotionPose, 't' | 'rot'> = { hipsRot: [84.6, 0, 0], shift: [0, 0, -0.279] }
/** 以脚尖为支点起跳 / 落地时脚趾背屈，否则跖屈的脚尖会扎进地面 */
const BURPEE_EXTEND = merge(JUMP_EXTEND, both({ LeftToeBase: [-30, 0, 0] }))
const BURPEE_TOUCH = merge(JUMP_TOUCH, both({ LeftToeBase: [-25, 0, 0] }))
const UPRIGHT: EulerDeg = [0, 0, 0]
/** 前脚掌着地所需的抬高（米）和前移（让脚尖停在原位，而不是绕脚踝往后转） */
const JUMP_TOE_LIFT = 0.076
const JUMP_TOUCH_LIFT = 0.064
const JUMP_TOE_SHIFT: [number, number, number] = [0, 0, 0.07]

/** 肩推起始：杠铃架在锁骨前，握距略宽于肩，前臂接近竖直、肘在杠铃稍前下方 */
const PRESS_RACK = merge(STAND, both({ LeftArm: [-15, 40, -92], LeftForeArm: [0, -147, 0], LeftHand: [61, -40, 15] }))
/** 肩推顶端：手臂伸直锁定，杠铃在肩关节 / 脚掌中部正上方 */
const PRESS_TOP_ARMS = both({ LeftArm: [44, 79, 46], LeftForeArm: [0, -5, 0], LeftHand: [-173, 0, 2] })
const PRESS_TOP = merge(STAND, PRESS_TOP_ARMS)
/** 推起途中杠铃贴着脸垂直上行（过下巴、过额头），不向前绕 */
const PRESS_CHIN = merge(STAND, both({ LeftArm: [-62, 21, -54], LeftForeArm: [0, -139, 0], LeftHand: [49, 0, -4] }))
const PRESS_BROW = merge(STAND, both({ LeftArm: [-116, 7, -72], LeftForeArm: [0, -103, 0], LeftHand: [73, 0, -18] }))

const TUCK = both({
  LeftUpLeg: [-16, 4, 4],
  LeftLeg: [70, 0, 0],
  LeftFoot: [-12, 0, 0],
})

// ------------------------------------------------------------
// 仰卧类：屈膝踩地的用 plant = feet（双脚钉在地面），身体朝向由 hipsRot 决定
// ------------------------------------------------------------

/** 仰卧屈膝：脚跟离臀部约一掌（膝约 55°），双脚踩实与髋同宽，肩背和后脑贴地 */
const HOOK = both({
  LeftUpLeg: [-38, 0, 3],
  LeftLeg: [120, 0, 0],
  LeftFoot: [15, 0, 0],
  Spine: [-1, 0, 0],
  Spine1: [3, 0, 0],
  Spine2: [1, 0, 0],
  Neck: [8, 0, 0],
  Head: [-11, 0, 0],
})
const HOOK_LYING: Pick<MotionPose, 'hipsRot'> = { hipsRot: [-98, 0, 0] }
/** 双臂放在身体两侧地面，掌心朝下 */
const ARMS_ON_FLOOR = both({ LeftArm: [25, -30, -65], LeftForeArm: [0, -10, 0], LeftHand: [54, 0, -1] })
/** 指尖轻触耳侧，肘向两侧打开 */
const HANDS_AT_EARS = both({ LeftArm: [-22, 9, -41], LeftForeArm: [0, -150, 0], LeftHand: [-7, -43, 15] })

/** 平躺伸腿（仰卧举腿）：下背贴地 */
const LYING: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [0, 16, 6], hipsRot: [-88, 0, 0] }
const LEG_RAISE_DOWN = both({
  LeftUpLeg: [-4, 0, 2],
  LeftLeg: [4, 0, 0],
  LeftFoot: [20, 0, 0],
  Spine: [-5, 0, 0],
  LeftArm: [30, -45, -59],
  LeftForeArm: [0, -9, 0],
  LeftHand: [39, 0, 0],
})
/** 双腿并拢伸直抬到接近垂直 */
const LEG_RAISE_UP = merge(LEG_RAISE_DOWN, both({ LeftUpLeg: [-95, 0, 2] }))

/** 仰卧起坐顶端：卷起到躯干约 75°，臀部和双脚不动，下巴微收 */
const SIT_UP_TOP = merge(
  both({
    LeftUpLeg: [-100, 0, 3],
    LeftLeg: [125, 0, 0],
    LeftFoot: [18, 0, 0],
    Spine: [22, 0, 0],
    Spine1: [22, 0, 0],
    Spine2: [22, 0, 0],
    Neck: [1, 0, 0],
    Head: [3, 0, 0],
  }),
  HANDS_AT_EARS,
)
/** 卷腹顶端：胸椎卷起，肩胛离地约 9 cm，下背留在地面 */
const CRUNCH_TOP = merge(HOOK, HANDS_AT_EARS, both({ Spine: [-5, 0, 0], Spine1: [33, 0, 0], Spine2: [21, 0, 0], Neck: [1, 0, 0], Head: [3, 0, 0] }))

/** 俄罗斯转体：坐在臀部上，躯干后倾约 45°、背部中立，双脚踩地，双手胸前合十 */
const TWIST_SEAT: Pick<MotionPose, 'hipsRot'> = { hipsRot: [-43, 0, 0] }
const twistTo = (deg: number) =>
  both({
    LeftUpLeg: [-89, 0, 3],
    LeftLeg: [89, 0, 0],
    LeftFoot: [40, 0, 0],
    Spine: [0, deg, 0],
    Spine1: [2, deg, 0],
    Spine2: [1, deg, 0],
    Neck: [-3, 0, 0],
    LeftArm: [-53, 2, -108],
    RightArm: [-53, -2, 108],
    LeftForeArm: [0, -50, 0],
    LeftHand: [18, -16, 10],
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

/** 俯卧位（面朝下），与仰卧 FLOOR 相对的髋部旋转 */
const PRONE: Pick<MotionPose, 'hips' | 'hipsRot'> = {
  hips: [0, 8, -2],
  hipsRot: [90, 0, 0],
}
// ------------------------------------------------------------
// 新增徒手动作的姿势
// ------------------------------------------------------------

/** 臀桥底部：仰卧屈膝，手臂贴地 */
const GLUTE_BRIDGE_DOWN = merge(HOOK, ARMS_ON_FLOOR)
/** 臀桥顶端：肩背和双脚不动，髋部顶起到肩、髋、膝一条直线，腰椎保持中立不后仰 */
const GLUTE_BRIDGE_TOP = both({
  LeftUpLeg: [-10, 0, 3],
  LeftLeg: [110, 0, 0],
  LeftFoot: [11, 0, 0],
  Spine: [0, 0, 0],
  Spine1: [-1, 0, 0],
  Spine2: [2, 0, 0],
  Neck: [28, 0, 0],
  Head: [-15, 0, 0],
  LeftArm: [50, -52, -58],
  LeftForeArm: [0, -10, 0],
  LeftHand: [32, 0, -1],
})
const BRIDGE_UP: Pick<MotionPose, 'hipsRot'> = { hipsRot: [-111, 0, 0] }

/** 侧平板：右侧在下，右肘在肩正下方、前臂平贴地面向前，双脚叠放，头到脚一条直线，左臂向上伸直 */
const SIDE_PLANK_ROT: Record<string, EulerDeg> = {
  RightArm: [-11, 2, 12],
  RightForeArm: [0, 88, 0],
  RightHand: [88, 45, -3],
  LeftArm: [-19, 0, 12],
  LeftForeArm: [0, -4, 0],
  Spine: [8, 0, 0],
  Spine1: [0, 0, 2],
  LeftUpLeg: [-4, 0, 2],
  RightUpLeg: [-4, 0, 0],
  LeftLeg: [2, 0, 0],
  RightLeg: [2, 0, 0],
  LeftFoot: [34, 0, 0],
  RightFoot: [34, 0, 0],
}
const SIDE_PLANK: Pick<MotionPose, 'hips' | 'hipsRot'> = {
  hips: [0, 40, 0],
  hipsRot: [2, 1, 76],
}

// ------------------------------------------------------------
// 俯撑类（plant = hands）：双手掌心贴地，身体绕手转到脚尖着地
// ------------------------------------------------------------

/** 俯撑的腿：腿伸直、脚尖撑地、脚趾平贴地面 */
const SUPPORT_LEGS = both({ LeftUpLeg: [-3, 2, 2], LeftLeg: [2, 0, 0], LeftFoot: [-24, 0, 0], LeftToeBase: [-39, 0, 0] })
/** 身体放低时踝背屈更多，脚趾仍贴地 */
const SUPPORT_LEGS_LOW = both({ LeftUpLeg: [-3, 2, 2], LeftLeg: [2, 0, 0], LeftFoot: [-27, 0, 0], LeftToeBase: [-54, 0, 0] })

/** 直臂支撑：手在肩正下方、略宽于肩，肘窝朝前，头颈中立 */
const PUSHUP_TOP = merge(
  SUPPORT_LEGS,
  both({ LeftArm: [-72, -35, -80], LeftForeArm: [0, -4, 0], LeftHand: [45, -6, 85], Spine: [8, 0, 0], Head: [-5, 0, 0] }),
)
/** 俯卧撑底部：胸离地约 5 cm，上臂与躯干约 35°，前臂接近竖直 */
const PUSHUP_BOTTOM = merge(
  SUPPORT_LEGS_LOW,
  both({ LeftArm: [13, 11, -58], LeftForeArm: [0, -139, 0], LeftHand: [51, 18, 69], Spine: [8, 0, 0], Head: [-16, 0, 0] }),
)
/** 推起落地：肘微屈缓冲（约 150°） */
const PUSHUP_LAND = merge(
  SUPPORT_LEGS,
  both({ LeftArm: [-57, -29, -72], LeftForeArm: [0, -30, 0], LeftHand: [48, 3, 77], Spine: [8, 0, 0], Head: [-5, 0, 0] }),
)

/** 登山跑：直臂支撑，一侧屈髋屈膝把膝盖收到胸下，脚离地 */
const MOUNTAIN_CLIMBER_LEFT = merge(PUSHUP_TOP, {
  LeftUpLeg: [-112, -20, 2],
  LeftLeg: [126, 0, 0],
  LeftFoot: [50, 0, 0],
  LeftToeBase: [0, 0, 0],
})
const MOUNTAIN_CLIMBER_RIGHT = merge(PUSHUP_TOP, {
  RightUpLeg: [-112, 20, -2],
  RightLeg: [126, 0, 0],
  RightFoot: [50, 0, 0],
  RightToeBase: [0, 0, 0],
})

/** 钻石俯卧撑：双手并拢在胸骨下方，手指向内成菱形 */
const DIAMOND_TOP = merge(
  SUPPORT_LEGS,
  both({ LeftArm: [-70, 8, -100], LeftForeArm: [0, -4, 0], LeftHand: [135, 10, 86], Spine: [8, 0, 0], Head: [-5, 0, 0] }),
)
/** 钻石底部：肘贴肋骨向后，胸部落到手背上方 */
const DIAMOND_BOTTOM = merge(
  SUPPORT_LEGS_LOW,
  both({ LeftArm: [12, -32, -74], LeftForeArm: [0, -127, 0], LeftHand: [134, 14, 47], Spine: [9, 0, 0], Head: [-12, 0, 0] }),
)

/** 前臂平板：肘在肩正下方，前臂平贴地面向前 */
const FOREARM_PLANK = both({
  LeftUpLeg: [-8, 2, 2],
  LeftLeg: [2, 0, 0],
  LeftFoot: [-26, 0, 0],
  LeftToeBase: [-48, 0, 0],
  LeftArm: [-90, -9, -87],
  LeftForeArm: [0, -90, 0],
  LeftHand: [87, -2, -2],
  Spine: [2, 0, 0],
  Head: [-8, 0, 0],
})

/** 超人式：俯卧在地，双臂前伸过头呈 Y 字，掌心朝下 */
const SUPERMAN_FLOOR: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [0, 12, -2], hipsRot: [90, 0, 0] }
const SUPERMAN_DOWN = both({
  LeftUpLeg: [-5, 2, 2],
  LeftLeg: [8, 0, 0],
  LeftFoot: [25, 0, 0],
  LeftArm: [-162, -21, -69],
  LeftForeArm: [0, -4, 0],
  LeftHand: [70, 0, -1],
  Spine: [3, 0, 0],
  Spine1: [-1, 0, 0],
  Spine2: [-2, 0, 0],
  Neck: [-4, 0, 0],
  Head: [-9, 0, 0],
})
/** 超人式顶端：骨盆贴地，胸离地约 10 cm，手臂顺着上背延长线抬起，腿伸直脚离地约 15 cm，头颈中立看地面 */
const SUPERMAN_UP = both({
  LeftUpLeg: [8, 2, 2],
  LeftLeg: [0, 0, 0],
  LeftFoot: [26, 0, 0],
  LeftArm: [-171, -43, -64],
  LeftForeArm: [0, -4, 0],
  LeftHand: [57, -2, -18],
  Spine: [-7, 0, 0],
  Spine1: [-8, 0, 0],
  Spine2: [2, 0, 0],
  Neck: [-13, 0, 0],
  Head: [-8, 0, 0],
})

// 侧弓步（plant = none，髋部位置写死，右脚始终踩在站姿原位）
/** 双手胸前合十保持平衡 */
const CLASP = both({ LeftArm: [-29, -19, -99], LeftForeArm: [0, -93, 0] })
const SIDE_LUNGE_STAND = merge(STAND, CLASP)
const SIDE_LUNGE_STAND_AT: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [0, 103.2, 3.5], hipsRot: [0, 0, 0] }
/** 迈步中：重心在右腿，左脚离地约 14 cm 向侧方跨出 */
const SIDE_LUNGE_STEP_LEFT = merge(CLASP, {
  LeftUpLeg: [-56, -10, 4],
  LeftLeg: [55, 0, 0],
  LeftFoot: [-8, 0, -18],
  RightUpLeg: [-33, -2, -17],
  RightLeg: [11, 0, 0],
  RightFoot: [4, 1, 7],
  Spine: [-2, 0, 0],
  Spine1: [-2, 0, 0],
  Head: [-10, 0, 0],
})
const SIDE_LUNGE_STEP_LEFT_AT: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [6.1, 102.4, -8.5], hipsRot: [17, 5, 8] }
/** 落脚：左脚全脚掌踩地、膝微屈，躯干仍较直立 */
const SIDE_LUNGE_TOUCH_LEFT = merge(CLASP, {
  LeftUpLeg: [-60, 0, 30],
  LeftLeg: [31, 0, 0],
  LeftFoot: [6, -10, -16],
  RightUpLeg: [-32, 7, -23],
  RightLeg: [5, 0, 0],
  RightFoot: [13, 1, 31],
  Spine: [6, 0, 0],
  Spine1: [3, 0, 0],
  Head: [-10, 0, 0],
})
const SIDE_LUNGE_TOUCH_LEFT_AT: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [39.1, 87.7, -23.4], hipsRot: [15, 3, -8] }
/** 侧弓步低位：两脚相距约 95 cm、全脚掌踩地脚尖朝前；左膝约 90° 对准脚尖，臀部后坐，右腿伸直，背部中立前倾约 30° */
const SIDE_LUNGE_LEFT = merge(CLASP, {
  LeftUpLeg: [-74, -10, 35],
  LeftLeg: [83, 0, 0],
  LeftFoot: [-23, -9, -13],
  RightUpLeg: [-29, 5, -27],
  RightLeg: [0, 0, 0],
  RightFoot: [8, 5, 42],
  Spine: [16, 0, 0],
  Spine1: [9, 0, 0],
  Neck: [-9, 0, 0],
  Head: [-18, 0, 0],
})
const SIDE_LUNGE_LEFT_AT: Pick<MotionPose, 'hips' | 'hipsRot'> = { hips: [55, 77.9, -8.4], hipsRot: [17, -8, -12] }

// ------------------------------------------------------------
// 对比模式：标准动作（FBX 主演示的生成版，供双画布对比的"标准"侧）
// ------------------------------------------------------------

/** 深蹲全程（与 FBX 主演示节奏一致） */
const SQUAT_VALGUS = both({
  LeftUpLeg: [-86, -26, -12],
  LeftLeg: [112, -10, -6],
  LeftFoot: [-24, 0, 0],
  Spine: [26, 0, 0],
  Spine1: [8, 0, 0],
  LeftArm: [52, 22, -52],
  LeftForeArm: [0, -52, 0],
})

/** 俯卧撑塌腰：髋部掉到肩踝连线以下约 8 cm */
const PUSHUP_SAG = merge(PUSHUP_TOP, both({ LeftUpLeg: [15, 2, 2], LeftHand: [46, -5, 85], Spine: [7, 0, 0], Spine1: [14, 0, 0] }))
const PUSHUP_SAG_BOTTOM = merge(
  PUSHUP_BOTTOM,
  both({ LeftUpLeg: [10, 2, 2], LeftHand: [51, 19, 64], Spine: [3, 0, 0], Spine1: [10, 0, 0] }),
)
/** 平板塌腰：腰椎伸展，髋部掉到肩踝连线以下约 10 cm，前臂仍贴地 */
const FOREARM_PLANK_SAG = merge(
  FOREARM_PLANK,
  both({ LeftUpLeg: [0, 2, 2], LeftArm: [-76, -9, -88], LeftForeArm: [0, -89, 0], LeftHand: [88, -1, -2], Spine: [-18, 0, 0], Spine1: [7, 0, 0] }),
)

// ------------------------------------------------------------
// 对比模式：常见错误变体（标准姿势的最小关节改动）
// ------------------------------------------------------------

/** 硬拉弓背：腰椎大幅屈曲 + 低头 */
const DEADLIFT_ARCH = both({
  LeftUpLeg: [-76, 4, 6],
  LeftLeg: [52, 0, 0],
  LeftFoot: [-14, 0, 0],
  Spine: [54, 0, 0],
  Spine1: [26, 0, 0],
  Neck: [18, 0, 0],
  Head: [20, 0, 0],
  LeftArm: [16, 4, -78],
  LeftForeArm: [0, -8, 0],
})

/** 硬拉锁定后仰：腰椎过度伸展 */
const DEADLIFT_HYPER = merge(STAND, both({ Spine: [-16, 0, 0], Spine1: [-10, 0, 0], Head: [-8, 0, 0] }))

/** 早安式弓背：铰链位脊柱屈曲 + 低头 */
const GM_ARCH = merge(
  HINGE,
  both({
    Spine: [64, 0, 0],
    Spine1: [26, 0, 0],
    Neck: [22, 0, 0],
    Head: [18, 0, 0],
    LeftUpLeg: [-62, 2, 3],
    LeftLeg: [14, 0, 0],
    LeftArm: [-80, -40, 40],
    LeftForeArm: [0, -86, 0],
  }),
)


export const MOTIONS: Record<string, MotionDef> = {
  // ---------- 对比模式：标准动作（供双画布"标准"侧） ----------
  squat: {
    duration: 2.6,
    plant: 'feet',
    poses: [pose(0, STAND), pose(1.05, SQUAT), pose(1.4, SQUAT), pose(2.6, STAND)],
  },
  'push-up': {
    duration: 2.2,
    plant: 'hands',
    poses: [
      pose(0, PUSHUP_TOP, PRONE),
      pose(0.85, PUSHUP_BOTTOM, PRONE),
      pose(1.2, PUSHUP_BOTTOM, PRONE),
      pose(2.2, PUSHUP_TOP, PRONE),
    ],
  },
  plank: {
    duration: 1.6,
    plant: 'hands',
    poses: [pose(0, FOREARM_PLANK, PRONE), pose(1.6, FOREARM_PLANK, PRONE)],
  },

  // ---------- 对比模式：常见错误变体 ----------
  'squat-x-valgus': {
    duration: 2.6,
    plant: 'feet',
    poses: [pose(0, STAND), pose(1.05, SQUAT_VALGUS), pose(1.4, SQUAT_VALGUS), pose(2.6, STAND)],
  },
  'push-up-x-sag': {
    duration: 2.2,
    plant: 'hands',
    poses: [
      pose(0, PUSHUP_SAG, PRONE),
      pose(0.85, PUSHUP_SAG_BOTTOM, PRONE),
      pose(1.2, PUSHUP_SAG_BOTTOM, PRONE),
      pose(2.2, PUSHUP_SAG, PRONE),
    ],
  },
  'plank-x-sag': {
    duration: 1.6,
    plant: 'hands',
    poses: [pose(0, FOREARM_PLANK_SAG, PRONE), pose(1.6, FOREARM_PLANK_SAG, PRONE)],
  },
  'deadlift-x-arch': {
    duration: 2.6,
    plant: 'feet',
    poses: [pose(0, STAND), pose(1.05, DEADLIFT_ARCH), pose(1.4, DEADLIFT_ARCH), pose(2.6, STAND)],
  },
  'deadlift-x-hyper': {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(1.05, DEADLIFT_BOTTOM),
      pose(1.4, DEADLIFT_BOTTOM),
      pose(2.1, DEADLIFT_HYPER),
      pose(2.6, DEADLIFT_HYPER),
    ],
  },
  'bicep-curl-x-swing': {
    duration: 2.2,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      // 先向后仰蓄力
      pose(0.4, merge(STAND, both({ Spine: [-12, 0, 0], LeftForeArm: [0, -40, 0] }))),
      // 甩身前倾借力把哑铃"荡"起来
      pose(0.8, merge(STAND, both({ Spine: [20, 0, 0], Spine1: [8, 0, 0], LeftForeArm: [0, -142, 0] }))),
      pose(1.15, merge(STAND, both({ Spine: [16, 0, 0], LeftForeArm: [0, -142, 0] }))),
      pose(2.2, STAND),
    ],
  },
  'bench-press-x-flare': {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), HOOK_LYING),
      // 底部上臂完全外展成 90°（T 位），肘部压力剧增
      pose(0.85, merge(HOOK, both({ LeftArm: [-14, -70, -26], LeftForeArm: [0, -20, 0] })), HOOK_LYING),
      pose(1.2, merge(HOOK, both({ LeftArm: [-14, -70, -26], LeftForeArm: [0, -20, 0] })), HOOK_LYING),
      pose(2.4, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), HOOK_LYING),
    ],
  },
  'good-morning-x-arch': {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
      pose(1.1, GM_ARCH),
      pose(1.45, GM_ARCH),
      pose(2.6, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
    ],
  },

  // ---------- 原有动作 ----------
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
    poses: [
      pose(0, PRESS_RACK),
      pose(0.3, PRESS_CHIN),
      pose(0.55, PRESS_BROW),
      pose(0.9, PRESS_TOP),
      pose(1.25, PRESS_TOP),
      pose(1.65, PRESS_BROW),
      pose(1.95, PRESS_CHIN),
      pose(2.4, PRESS_RACK),
    ],
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
  /** 深蹲 → 蹬伸离地（踝跖屈、手臂上摆）→ 腾空 → 前脚掌触地 → 屈髋屈膝缓冲 → 站起 */
  'jump-squat': {
    duration: 2.2,
    plant: 'feet',
    segments: [{ tempo: 1.3 }, { tempo: 0.5 }, {}, {}, { tempo: 1.3 }, {}],
    poses: [
      pose(0, STAND),
      pose(0.7, SQUAT),
      pose(0.88, JUMP_EXTEND, { hop: JUMP_TOE_LIFT, shift: JUMP_TOE_SHIFT }),
      pose(1.08, JUMP_AIR, { hop: 0.28, shift: JUMP_TOE_SHIFT }),
      pose(1.28, JUMP_TOUCH, { hop: JUMP_TOUCH_LIFT, shift: JUMP_TOE_SHIFT }),
      pose(1.5, JUMP_LAND),
      pose(2.2, STAND),
    ],
  },
  /** 下蹲双手撑地 → 双脚后跳成平板 → 收腿跳回 → 蹬伸起跳 → 前脚掌落地屈膝缓冲 → 站起 */
  burpee: {
    duration: 3,
    plant: 'toes',
    segments: [{ tempo: 1.2 }, {}, {}, {}, {}, {}, {}, {}, { tempo: 0.6 }, {}, {}, { tempo: 1.3 }, {}],
    poses: [
      pose(0, STAND, { hipsRot: UPRIGHT }),
      pose(0.45, BURPEE_SQUAT, BURPEE_SQUAT_AT),
      pose(0.53, BURPEE_TUCK, BURPEE_TUCK_AT),
      pose(0.62, BURPEE_KICK, BURPEE_KICK_AT),
      pose(0.75, PUSHUP_TOP, BURPEE_PLANK_AT),
      pose(1.0, PUSHUP_TOP, BURPEE_PLANK_AT),
      pose(1.13, BURPEE_KICK, BURPEE_KICK_AT),
      pose(1.22, BURPEE_TUCK, BURPEE_TUCK_AT),
      pose(1.3, BURPEE_SQUAT, BURPEE_SQUAT_AT),
      pose(1.5, BURPEE_EXTEND, { hipsRot: UPRIGHT }),
      pose(1.72, JUMP_AIR, { hop: 0.3, hipsRot: UPRIGHT }),
      pose(1.94, BURPEE_TOUCH, { hipsRot: UPRIGHT }),
      pose(2.2, JUMP_LAND, { hipsRot: UPRIGHT }),
      pose(3, STAND, { hipsRot: UPRIGHT }),
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
    // 下摆稍慢，髋发力快，顶端短停，再摆回腿间。不要在站姿上把手慢慢放下。
    segments: [{ hold: 0.2 }, { tempo: 0.38 }, { hold: 0.35 }, { tempo: 0.7 }],
    poses: [
      pose(0, KB_HIKE),
      pose(0.24, KB_HIKE),
      pose(0.6, KB_TOP),
      pose(0.98, KB_TOP),
      pose(2.2, KB_HIKE),
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
    plant: 'feet',
    poses: [
      pose(0, merge(HOOK, HANDS_AT_EARS), HOOK_LYING),
      pose(0.9, SIT_UP_TOP, { hipsRot: [-44, 0, 0] }),
      pose(1.25, SIT_UP_TOP, { hipsRot: [-44, 0, 0] }),
      pose(2.4, merge(HOOK, HANDS_AT_EARS), HOOK_LYING),
    ],
  },
  crunch: {
    duration: 2,
    plant: 'feet',
    poses: [
      pose(0, merge(HOOK, HANDS_AT_EARS), HOOK_LYING),
      pose(0.7, CRUNCH_TOP, HOOK_LYING),
      pose(1.05, CRUNCH_TOP, HOOK_LYING),
      pose(2, merge(HOOK, HANDS_AT_EARS), HOOK_LYING),
    ],
  },
  'lying-leg-raise': {
    duration: 2.4,
    plant: 'none',
    poses: [
      pose(0, LEG_RAISE_DOWN, LYING),
      pose(0.9, LEG_RAISE_UP, LYING),
      pose(1.25, LEG_RAISE_UP, LYING),
      pose(2.4, LEG_RAISE_DOWN, LYING),
    ],
  },
  'bench-press': {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), HOOK_LYING),
      pose(0.85, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), HOOK_LYING),
      pose(1.2, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), HOOK_LYING),
      pose(2.4, merge(HOOK, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), HOOK_LYING),
    ],
  },
  /** 胸椎带着双手左右转动，骨盆和双脚不动 */
  'russian-twist': {
    duration: 2,
    plant: 'feet',
    poses: [pose(0, twistTo(-15), TWIST_SEAT), pose(1, twistTo(15), TWIST_SEAT), pose(2, twistTo(-15), TWIST_SEAT)],
  },

  /** 杠铃锁在头顶的深蹲，供过头深蹲的对比模式 */
  'overhead-squat': {
    duration: 2.6,
    plant: 'feet',
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(1.05, merge(SQUAT, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(1.4, merge(SQUAT, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(2.6, merge(STAND, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
    ],
  },
  /** 开合跳：站立 ↔ 分腿举手 */
  'jumping-jack': {
    duration: 1.6,
    plant: 'feet',
    poses: [
      pose(0, STAND),
      pose(
        0.35,
        merge(both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], LeftUpLeg: [-10, 6, 18], LeftLeg: [8, 0, 0] })),
        { hop: 0.06 },
      ),
      pose(0.8, STAND),
      pose(
        1.15,
        merge(both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], LeftUpLeg: [-10, 6, 18], LeftLeg: [8, 0, 0] })),
        { hop: 0.06 },
      ),
      pose(1.6, STAND),
    ],
  },
  /** 击掌俯卧撑的生成版：下落后爆发推起，双手离地，屈肘缓冲落地 */
  'jump-push-up': {
    duration: 2.2,
    plant: 'hands',
    segments: [{ tempo: 1.4 }, { tempo: 0.5 }, { tempo: 1 }, { tempo: 1.2 }],
    poses: [
      pose(0, PUSHUP_TOP, PRONE),
      pose(0.7, PUSHUP_BOTTOM, PRONE),
      pose(1.0, PUSHUP_TOP, { ...PRONE, hop: 0.14 }),
      pose(1.3, PUSHUP_LAND, PRONE),
      pose(2.2, PUSHUP_TOP, PRONE),
    ],
  },

  // ---------- 新增徒手动作 ----------
  'glute-bridge': {
    duration: 2.4,
    plant: 'feet',
    poses: [
      pose(0, GLUTE_BRIDGE_DOWN, HOOK_LYING),
      pose(0.9, GLUTE_BRIDGE_TOP, BRIDGE_UP),
      pose(1.3, GLUTE_BRIDGE_TOP, BRIDGE_UP),
      pose(2.4, GLUTE_BRIDGE_DOWN, HOOK_LYING),
    ],
  },
  'side-plank': {
    duration: 1.6,
    plant: 'none',
    poses: [pose(0, SIDE_PLANK_ROT, SIDE_PLANK), pose(1.6, SIDE_PLANK_ROT, SIDE_PLANK)],
  },
  'mountain-climber': {
    duration: 1.2,
    plant: 'hands',
    segments: [{ hold: 0.2 }, { hold: 0.2 }],
    poses: [
      pose(0, MOUNTAIN_CLIMBER_LEFT, PRONE),
      pose(0.6, MOUNTAIN_CLIMBER_RIGHT, PRONE),
      pose(1.2, MOUNTAIN_CLIMBER_LEFT, PRONE),
    ],
  },
  'diamond-push-up': {
    duration: 2.2,
    plant: 'hands',
    poses: [
      pose(0, DIAMOND_TOP, PRONE),
      pose(0.85, DIAMOND_BOTTOM, PRONE),
      pose(1.2, DIAMOND_BOTTOM, PRONE),
      pose(2.2, DIAMOND_TOP, PRONE),
    ],
  },
  superman: {
    duration: 2.4,
    plant: 'none',
    poses: [
      pose(0, SUPERMAN_DOWN, SUPERMAN_FLOOR),
      pose(0.9, SUPERMAN_UP, SUPERMAN_FLOOR),
      pose(1.3, SUPERMAN_UP, SUPERMAN_FLOOR),
      pose(2.4, SUPERMAN_DOWN, SUPERMAN_FLOOR),
    ],
  },
  /** 左脚侧跨 → 下蹲 → 蹬回 → 右侧重复。支撑脚全程不动 */
  'side-lunge': {
    duration: 3.2,
    plant: 'none',
    segments: [{}, {}, { tempo: 1.4 }, {}, { tempo: 0.7 }, {}, {}, {}, {}, { tempo: 1.4 }, {}, { tempo: 0.7 }, {}, {}],
    poses: [
      pose(0, SIDE_LUNGE_STAND, SIDE_LUNGE_STAND_AT),
      pose(0.25, SIDE_LUNGE_STEP_LEFT, SIDE_LUNGE_STEP_LEFT_AT),
      pose(0.42, SIDE_LUNGE_TOUCH_LEFT, SIDE_LUNGE_TOUCH_LEFT_AT),
      pose(0.8, SIDE_LUNGE_LEFT, SIDE_LUNGE_LEFT_AT),
      pose(1.05, SIDE_LUNGE_LEFT, SIDE_LUNGE_LEFT_AT),
      pose(1.28, SIDE_LUNGE_TOUCH_LEFT, SIDE_LUNGE_TOUCH_LEFT_AT),
      pose(1.42, SIDE_LUNGE_STEP_LEFT, SIDE_LUNGE_STEP_LEFT_AT),
      pose(1.6, SIDE_LUNGE_STAND, SIDE_LUNGE_STAND_AT),
      pose(1.85, swapSides(SIDE_LUNGE_STEP_LEFT), swapPlace(SIDE_LUNGE_STEP_LEFT_AT)),
      pose(2.02, swapSides(SIDE_LUNGE_TOUCH_LEFT), swapPlace(SIDE_LUNGE_TOUCH_LEFT_AT)),
      pose(2.4, swapSides(SIDE_LUNGE_LEFT), swapPlace(SIDE_LUNGE_LEFT_AT)),
      pose(2.65, swapSides(SIDE_LUNGE_LEFT), swapPlace(SIDE_LUNGE_LEFT_AT)),
      pose(2.88, swapSides(SIDE_LUNGE_TOUCH_LEFT), swapPlace(SIDE_LUNGE_TOUCH_LEFT_AT)),
      pose(3.02, swapSides(SIDE_LUNGE_STEP_LEFT), swapPlace(SIDE_LUNGE_STEP_LEFT_AT)),
      pose(3.2, SIDE_LUNGE_STAND, SIDE_LUNGE_STAND_AT),
    ],
  },
}

/** 四拍动作（下-停-起）的默认节奏：离心慢、底部停、向心快 */
const LIFT_RHYTHM: MotionSegment[] = [{ tempo: 1.6 }, { hold: 0.28 }, { tempo: 0.6 }]

for (const id of [
  'squat',
  'deadlift',
  'push-up',
  'bicep-curl',
  'overhead-press',
  'bench-press',
  'romanian-deadlift',
  'good-morning',
  'calf-raise',
  'lateral-raise',
  'front-raise',
  'tricep-extension',
  'overhead-squat',
  'bent-over-row',
  'rear-delt-fly',
  'glute-bridge',
  'diamond-push-up',
  'superman',
]) {
  const motion = MOTIONS[id]
  if (motion && motion.poses.length === 4) motion.segments = LIFT_RHYTHM.map((s) => ({ ...s }))
}

MOTIONS.lunge.segments = [
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 },
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 },
]
