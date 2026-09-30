import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ModelViewer from '../components/ModelViewer'
import CompareView from '../components/CompareView'
import { exercises } from '../data/exercises'
import { DIFFICULTY_CLASS } from '../types'
import type { ErrorVariant } from '../types'

export default function ExercisePage() {
  const { id } = useParams()
  const exercise = exercises.find((e) => e.id === id)
  /** 播放临近/跳转到某个关键帧时，联动高亮的要点下标 */
  const [activePoint, setActivePoint] = useState<number | null>(null)
  /** 点击要点 → 请求查看器跳到对应关键帧；n 自增以重复触发 */
  const [jumpReq, setJumpReq] = useState<{ at: number; point: number; n: number } | null>(null)
  /** 当前对比模式演示的错误变体；null = 普通查看模式 */
  const [compareError, setCompareError] = useState<ErrorVariant | null>(null)
  const pointsRef = useRef<(HTMLLIElement | null)[]>([])

  const handleActivePoint = useCallback((p: number | null) => setActivePoint(p), [])

  // 关键帧临近 → 侧栏要点滚动到可见
  useEffect(() => {
    if (activePoint == null) return
    pointsRef.current[activePoint]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activePoint])

  // 切换动作 / 切换对比变体时重置要点联动与跳帧请求
  useEffect(() => {
    setActivePoint(null)
    setJumpReq(null)
  }, [id, compareError])

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

  /** 有错误变体且有对应标准生成动作时才支持对比模式 */
  const canCompare =
    !!exercise.errors?.length && !!(exercise.compareMotion || exercise.generated)

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
          {canCompare && (
            <button
              className="tag compare-btn"
              onClick={() => setCompareError((e) => e ?? exercise.errors![0])}
              title="分屏对照标准与错误示范"
            >
              ⚖ 错误对比
            </button>
          )}
          {exercise.program && (
            <Link to={`/train/${exercise.id}`} className="tag train-btn" title="跟着 3D 节拍训练">
              🏃 跟练
            </Link>
          )}
        </div>
      </header>

      <div className="detail-grid">
        {compareError && canCompare ? (
          <CompareView
            key={`${exercise.id}-${compareError.motionId}`}
            exercise={exercise}
            error={compareError}
            onExit={() => setCompareError(null)}
            onSelectError={setCompareError}
          />
        ) : (
          <ModelViewer
            key={exercise.id}
            exercise={exercise}
            onActivePointChange={handleActivePoint}
            jumpRequest={jumpReq}
          />
        )}

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
            <p className="panel-tip">点击要点可跳到对应关键帧 · 播放到关键帧附近会自动高亮</p>
            <ol>
              {exercise.keyPoints.map((k, i) => {
                const kf = exercise.keyframes?.find((f) => f.point === i)
                return (
                  <li
                    key={i}
                    ref={(el) => {
                      pointsRef.current[i] = el
                    }}
                    className={`point ${activePoint === i ? 'active' : ''} ${kf ? 'jumpable' : ''}`}
                    onClick={() => {
                      if (!kf) return
                      setJumpReq({ at: kf.at, point: i, n: (jumpReq?.n ?? 0) + 1 })
                    }}
                    title={kf ? '点击跳到这个关键帧' : undefined}
                  >
                    {k}
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="panel warn">
            <h2>⚠️ 常见错误</h2>
            <p className="panel-tip">
              {canCompare ? '点击带标志的错误可分屏对比标准示范' : '避开这些常见问题'}
            </p>
            <ul>
              {exercise.mistakes.map((m, i) => {
                const err = exercise.errors?.find((e) => e.label === m)
                return (
                  <li
                    key={i}
                    className={`point ${err ? 'jumpable mistake' : ''}`}
                    onClick={() => err && setCompareError(err)}
                    title={err ? '点击查看错误 vs 标准对比' : undefined}
                  >
                    {m}
                    {err && <span className="compare-flag">对比</span>}
                  </li>
                )
              })}
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
