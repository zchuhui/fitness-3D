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
  /** 一句话简介 */
  description: string
  /** 动作要点 */
  keyPoints: string[]
  /** 常见错误 */
  mistakes: string[]
  /** 建议组数，如 "3-4 组 × 8-12 次" */
  sets: string
  /** 3D 模型与动画 */
  model: ModelRef
  /** true = 当前演示为占位动画；替换成 Mixamo 标准动作后改为 false */
  placeholder?: boolean
  /** true = 由 src/motion 按标准关节角度生成，不依赖动作捕捉文件 */
  generated?: boolean
  /** 仰卧、卧推等贴地动作，查看器把视线放低 */
  camera?: 'floor'
}
