import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FollowAlongPanel from '../components/FollowAlong'
import { exercises } from '../data/exercises'
import { PLANS } from '../data/plans'
import { dateKey, logSession } from '../lib/storage'

/**
 * 计划跟练 /plan/:id
 * 按顺序逐个动作跟练：当前动作的 FollowAlong 完成后自动推进下一个，
 * 每个动作的成绩分别写入训练日志（source = plan）。
 */
export default function PlanPage() {
  const { id } = useParams()
  const plan = PLANS.find((p) => p.id === id)

  /** -1 = 概览页；0..n-1 = 跟练中；n = 全部完成 */
  const [step, setStep] = useState(-1)
  /** 已完成的动作成绩 */
  const [finished, setFinished] = useState<{ id: string; setsDone: number }[]>([])

  const steps = useMemo(
    () =>
      (plan?.exerciseIds ?? [])
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => !!e),
    [plan],
  )

  if (!plan) {
    return (
      <div className="page not-found">
        <h1>😅 没有找到这个计划</h1>
        <Link className="btn" to="/">
          返回动作库
        </Link>
      </div>
    )
  }

  const handleStepFinish = (exerciseId: string, setsDone: number) => {
    logSession({ date: dateKey(), exerciseId, setsDone, source: 'plan', planId: plan.id })
    setFinished((f) => [...f, { id: exerciseId, setsDone }])
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  // 概览
  if (step === -1) {
    return (
      <div className="page detail">
        <Link to="/" className="back">
          ← 返回动作库
        </Link>
        <header className="detail-header">
          <div>
            <h1>
              {plan.name}
              <span className="en">{steps.length} 个动作</span>
            </h1>
            <p className="desc">{plan.description}</p>
          </div>
          <div className="detail-badges">
            <span className="tag">{plan.tag}</span>
          </div>
        </header>

        <section className="panel plan-overview">
          <h2>📋 动作顺序</h2>
          <ol className="plan-steps">
            {steps.map((e, i) => (
              <li key={e.id}>
                <span className="plan-idx">{i + 1}</span>
                <Link to={`/exercise/${e.id}`} className="plan-name">
                  {e.name}
                </Link>
                <span className="plan-step-meta">
                  {e.muscle} · {e.program ? `${e.program.sets} 组` : e.sets}
                </span>
              </li>
            ))}
          </ol>
          <button className="btn fa-start" onClick={() => setStep(0)}>
            ▶ 开始整套跟练
          </button>
        </section>
      </div>
    )
  }

  // 全部完成
  if (step >= steps.length) {
    const totalSets = finished.reduce((s, f) => s + f.setsDone, 0)
    return (
      <div className="page detail">
        <header className="detail-header">
          <div>
            <h1>
              🎉 {plan.name} 完成
              <span className="en">Well done!</span>
            </h1>
            <p className="desc">
              {steps.length} 个动作 · 共 {totalSets} 组，成绩已写入训练日志。今天练到位了，好好拉伸休息。
            </p>
          </div>
        </header>
        <section className="panel">
          <h2>📊 本次成绩</h2>
          <ul className="recent-list">
            {finished.map((f) => {
              const ex = exercises.find((e) => e.id === f.id)
              return (
                <li key={f.id}>
                  <span className="recent-name">{ex?.name ?? f.id}</span>
                  <span className="recent-meta">{f.setsDone} 组</span>
                </li>
              )
            })}
          </ul>
          <div className="fa-btns" style={{ marginTop: 16 }}>
            <Link className="tb-btn" to="/history">
              📅 查看训练历史
            </Link>
            <button
              className="tb-btn"
              onClick={() => {
                setFinished([])
                setStep(-1)
              }}
            >
              ↻ 重新开始
            </button>
            <Link className="tb-btn primary" to="/">
              返回动作库
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // 跟练中
  const current = steps[step]

  return (
    <div className="page train-screen">
      <div className="plan-progress">
        <span className="plan-progress-label">
          {plan.name} · {step + 1} / {steps.length}
        </span>
        <div className="plan-progress-track">
          {steps.map((s, i) => (
            <span key={s.id} className={i < step ? 'done' : i === step ? 'now' : ''} />
          ))}
        </div>
      </div>

      <FollowAlongPanel
        key={current.id}
        exercise={current}
        onFinish={(setsDone) => handleStepFinish(current.id, setsDone)}
      />
    </div>
  )
}
