/**
 * 训练计划模板：引用动作库里的 exerciseId。
 * /plan/:id 按顺序逐个动作跟练，完成情况写入训练日志。
 */

export interface Plan {
  id: string
  name: string
  description: string
  /** 标签，用于卡片角标 */
  tag: string
  exerciseIds: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'push-day',
    name: '推力日',
    description: '胸、肩、三头，水平推 + 垂直推的完整刺激。',
    tag: '上肢',
    exerciseIds: ['push-up', 'bench-press', 'overhead-press', 'lateral-raise', 'tricep-extension'],
  },
  {
    id: 'pull-day',
    name: '拉力日',
    description: '背与二头，硬拉打底，划船建厚度，引体拉宽度。',
    tag: '上肢',
    exerciseIds: ['deadlift', 'bent-over-row', 'pull-up', 'rear-delt-fly', 'bicep-curl'],
  },
  {
    id: 'leg-day',
    name: '腿部日',
    description: '蹲 + 髋铰链 + 单侧 + 小腿，练完走路会抖的那种。',
    tag: '下肢',
    exerciseIds: ['squat', 'romanian-deadlift', 'lunge', 'calf-raise', 'jump-squat'],
  },
  {
    id: 'home-fullbody',
    name: '居家全身',
    description: '零器械，一块空地就够，40 分钟内完成的高效循环。',
    tag: '居家',
    exerciseIds: ['air-squat', 'push-up', 'jumping-jack', 'burpee', 'plank', 'crunch'],
  },
  {
    id: 'core-day',
    name: '核心专攻',
    description: '卷腹 + 举腿 + 转体 + 静态支撑，腹肌四面开花。',
    tag: '核心',
    exerciseIds: ['plank', 'crunch', 'lying-leg-raise', 'russian-twist', 'sit-up'],
  },
]
