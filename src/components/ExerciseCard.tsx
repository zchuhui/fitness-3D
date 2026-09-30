import { Link } from 'react-router-dom'
import { useGLTF } from '@react-three/drei'
import { DIFFICULTY_CLASS } from '../types'
import type { Exercise, MuscleGroup } from '../types'

/** 各肌群的卡片配色与图标 */
export const GROUP_STYLE: Record<MuscleGroup, { icon: string; gradient: string }> = {
  胸部: { icon: '🏋️', gradient: 'linear-gradient(135deg,#4a1f2b,#8c3548)' },
  背部: { icon: '🧗', gradient: 'linear-gradient(135deg,#16283f,#2b5a8c)' },
  腿部: { icon: '🦵', gradient: 'linear-gradient(135deg,#14352a,#2a7a5a)' },
  肩部: { icon: '🤸', gradient: 'linear-gradient(135deg,#3a2a14,#8c6a2b)' },
  手臂: { icon: '💪', gradient: 'linear-gradient(135deg,#2a1f3f,#6a4a9c)' },
  核心: { icon: '🧘', gradient: 'linear-gradient(135deg,#3f1f35,#9c4a8a)' },
  全身: { icon: '🔥', gradient: 'linear-gradient(135deg,#3f2a14,#b05a2b)' },
}

export default function ExerciseCard({ exercise: e }: { exercise: Exercise }) {
  const style = GROUP_STYLE[e.muscle]

  return (
    <Link
      to={`/exercise/${e.id}`}
      className="card"
      onMouseEnter={() => {
        // 悬停时预加载模型，点进详情页秒开
        if (e.model.url.toLowerCase().endsWith('.glb')) useGLTF.preload(e.model.url)
      }}
    >
      <div className="card-thumb" style={{ background: style.gradient }}>
        <span className="card-icon">{style.icon}</span>
        <span className="card-3d-badge">3D</span>
        {e.placeholder && <span className="card-ph-badge">占位动画</span>}
        {e.generated && <span className="card-gen-badge">生成演示</span>}
      </div>
      <div className="card-body">
        <div className="card-title">
          <h3>{e.name}</h3>
          <span className="card-en">{e.nameEn}</span>
        </div>
        <div className="card-tags">
          <span className="tag">{e.muscle}</span>
          <span className={`tag diff-${DIFFICULTY_CLASS[e.difficulty]}`}>{e.difficulty}</span>
          <span className="tag">{e.equipment}</span>
        </div>
        <span className="card-cta">查看 3D 演示 →</span>
      </div>
    </Link>
  )
}
