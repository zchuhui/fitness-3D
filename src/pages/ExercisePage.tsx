import { Link, useParams } from 'react-router-dom'
import ModelViewer from '../components/ModelViewer'
import { exercises } from '../data/exercises'
import { DIFFICULTY_CLASS } from '../types'

export default function ExercisePage() {
  const { id } = useParams()
  const exercise = exercises.find((e) => e.id === id)

  if (!exercise) {
    return (
      <div className="page not-found">
        <h1>😅 没有找到这个动作</h1>
        <Link className="btn" to="/">
          返回动作库
        </Link>
      </div>
    )
  }

  const idx = exercises.indexOf(exercise)
  const prev = exercises[(idx - 1 + exercises.length) % exercises.length]
  const next = exercises[(idx + 1) % exercises.length]

  return (
    <div className="page detail">
      <Link to="/" className="back">
        ← 返回动作库
      </Link>

      <header className="detail-header">
        <div>
          <h1>
            {exercise.name}
            <span className="en">{exercise.nameEn}</span>
          </h1>
          <p className="desc">{exercise.description}</p>
        </div>
        <div className="detail-badges">
          <span className="tag">{exercise.muscle}</span>
          <span className={`tag diff-${DIFFICULTY_CLASS[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
          <span className="tag">{exercise.equipment}</span>
        </div>
      </header>

      <div className="detail-grid">
        {/* key 保证切换动作时查看器完全重置 */}
        <ModelViewer key={exercise.id} exercise={exercise} />

        <aside className="info">
          <div className="stats">
            <div className="stat">
              <span>目标肌群</span>
              <b>{exercise.muscle}</b>
            </div>
            <div className="stat">
              <span>器械</span>
              <b>{exercise.equipment}</b>
            </div>
            <div className="stat">
              <span>难度</span>
              <b>{exercise.difficulty}</b>
            </div>
            <div className="stat">
              <span>建议组数</span>
              <b>{exercise.sets}</b>
            </div>
          </div>

          <section className="panel">
            <h2>✅ 动作要点</h2>
            <ol>
              {exercise.keyPoints.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ol>
          </section>

          <section className="panel warn">
            <h2>⚠️ 常见错误</h2>
            <ul>
              {exercise.mistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <nav className="prev-next">
        <Link to={`/exercise/${prev.id}`} className="pn-card">
          ← {prev.name}
        </Link>
        <Link to={`/exercise/${next.id}`} className="pn-card">
          {next.name} →
        </Link>
      </nav>
    </div>
  )
}
