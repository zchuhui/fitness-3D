export type MuscleGroup = '胸部' | '背部' | '腿部' | '肩部' | '手臂' | '核心' | '全身'

export type Difficulty = '初级' | '中级' | '高级'

/** 难度对应的样式类名 */
export const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  初级: 'easy',
  中级: 'mid',
  高级: 'hard',
}

export interface ModelRef {
  /** 模型文件路径（放在 public/models/ 下），支持 .glb 和 Mixamo 直接下载的 .fbx */
  url: string
  /** 要播放的动画剪辑名称；不填或找不到时自动播放文件中的第一个动画 */
  clip?: string
}

/** 动作关键帧：把动画时刻与动作要点关联起来，实现"看哪里 ↔ 讲哪里"联动 */
export interface Keyframe {
  /** 归一化时刻（0–1，相对剪辑总时长），兼容不同剪辑时长 */
  at: number
  /** 对应 keyPoints 的下标 */
  point: number
}

/** 错误示范：仅在对比模式里播放的程序生成动作 */
export interface ErrorVariant {
  /** 错误名称（与 mistakes 里的描述呼应） */
  label: string
  /** src/motion/motions.ts 里的错误变体动作 id */
  motionId: string
}

/** 跟练用的结构化训练参数（从 sets 文本派生） */
export interface Program {
  /** 组数 */
  sets: number
  /** 每组次数（与 seconds 二选一） */
  reps?: number
  /** 每组时长（秒），计时类动作如平板支撑用 */
  seconds?: number
  /** 组间休息（秒） */
  restSeconds: number
}

export interface Exercise {
  /** 唯一标识，用于路由 /exercise/:id */
  id: string
  /** 中文名 */
  name: string
  /** 英文名 */
  nameEn: string
  /** 目标肌群 */
  muscle: MuscleGroup
  /** 器械 */
  equipment: string
  /** 难度 */
  difficulty: Difficulty
  /** 练习类别，动作库里单独筛选 */
  style?: '瑜伽'
  /** 一句话简介 */
  description: string
  /** 动作要点 */
  keyPoints: string[]
  /** 常见错误 */
  mistakes: string[]
  /** 建议组数，如 "3-4 组 × 8-12 次" */
  sets: string
  /** 关键帧标注（可选）：时间轴圆点 + 要点联动 */
  keyframes?: Keyframe[]
  /** 错误示范变体（可选）：对比模式里双画布分屏演示 */
  errors?: ErrorVariant[]
  /** 对比模式里播放的标准生成动作 id；缺省用 generated 动作的 model.clip */
  compareMotion?: string
  /** 跟练参数（可选）：驱动 /train/:id 的组间计时 */
  program?: Program
  /** 3D 模型与动画 */
  model: ModelRef
  /** true = 当前演示为占位动画；替换成 Mixamo 标准动作后改为 false */
  placeholder?: boolean
  /** true = 由 src/motion 按标准关节角度生成，不依赖动作捕捉文件 */
  generated?: boolean
  /** 仰卧、卧推等贴地动作，查看器把视线放低 */
  camera?: 'floor'
  /**
   * 招牌姿势：归一化时刻（0–1），用于卡片海报图（/poster-studio 渲染）。
   * 缺省取关键帧列表的中间一帧，再缺省取 0.4。
   */
  posterAt?: number
  /** 封面机位角度微调（度）。缺省按姿势自动选：贴地动作偏侧面，站姿 3/4 前侧 */
  posterView?: { azimuth?: number; elevation?: number }
}
