import type { MuscleGroup } from '../types'
import { publicUrl } from './publicUrl'

/**
 * 肌群品牌色（聚光灯舞台的唯一色彩真相）：
 * - 卡片上以 CSS 变量 --grp 注入（氛围光、地面光斑、悬停辉光）
 * - 3D 舞台里作为轮廓光（rim light）颜色
 * - 与 index.css 的 --grp-* 令牌保持一致
 */
export const GROUP_COLOR: Record<MuscleGroup, string> = {
  胸部: '#ff6b81',
  背部: '#5ea2ff',
  腿部: '#3ddc84',
  肩部: '#ffc63d',
  手臂: '#c58cff',
  核心: '#ff7ac2',
  全身: '#ff9a4d',
}

/** 海报缺失时的降级视觉（渐变 + 图标，仅作兜底） */
export const GROUP_FALLBACK: Record<MuscleGroup, { icon: string; gradient: string }> = {
  胸部: { icon: '🏋️', gradient: 'linear-gradient(135deg,#4a1f2b,#8c3548)' },
  背部: { icon: '🧗', gradient: 'linear-gradient(135deg,#16283f,#2b5a8c)' },
  腿部: { icon: '🦵', gradient: 'linear-gradient(135deg,#14352a,#2a7a5a)' },
  肩部: { icon: '🤸', gradient: 'linear-gradient(135deg,#3a2a14,#8c6a2b)' },
  手臂: { icon: '💪', gradient: 'linear-gradient(135deg,#2a1f3f,#6a4a9c)' },
  核心: { icon: '🧘', gradient: 'linear-gradient(135deg,#3f1f35,#9c4a8a)' },
  全身: { icon: '🔥', gradient: 'linear-gradient(135deg,#3f2a14,#b05a2b)' },
}

/** 卡片海报图路径约定：/poster-studio 渲染写入 public/posters/ */
export const posterUrl = (id: string) => publicUrl(`/posters/${id}.webp`)
export const posterUrlPng = (id: string) => publicUrl(`/posters/${id}.png`)
