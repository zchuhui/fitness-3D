import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { exercises } from '../data/exercises'
import { clearLogs, dateKey, getLogs, setsByDate, statsRecent7 } from '../lib/storage'

const HEAT_WEEKS = 12

/** 组数 → 热力等级 */
function levelOf(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  return 3
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

/**
 * 训练历史 /history
 * - 12 周训练热力图（坚持可视化，留存的正反馈）
 * - 本周统计 + 最近记录
 */
export default function HistoryPage() {
  const [logs, setLogs] = useState(() => getLogs())
  const [confirming, setConfirming] = useState(false)

  const byDate = useMemo(() => setsByDate(), [logs])
  const stats = useMemo(() => statsRecent7(), [logs])
  const totalSets = useMemo(() => logs.reduce((s, l) => s + l.setsDone, 0), [logs])
  const topName = stats.topExerciseId
    ? (exercises.find((e) => e.id === stats.topExerciseId)?.name ?? stats.topExerciseId)
    : undefined

  // 最近 12 周（84 天）的格子：今天在最后一格
  const cells = useMemo(() => {
    const out: { date: string; count: number; label: string }[] = []
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - (HEAT_WEEKS * 7 - 1))
    for (let i = 0; i < HEAT_WEEKS * 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = dateKey(d)
      out.push({
        date: key,
        count: byDate.get(key) ?? 0,
        label: `${key} · ${byDate.get(key) ?? 0} 组`,
      })
    }
    return out
  }, [byDate])

  const recent = useMemo(() => [...logs].reverse().slice(0, 10), [logs])

  return (
    <div className="page">
      <section className="hero small">
        <h1>训练历史</h1>
        <p>每一次跟练都自动记录在这里 · 数据只存在你的浏览器本地</p>
      </section>

      <div className="history-grid">
        <section className="panel">
          <h2>🔥 最近 {stats.days > 0 ? stats.days : 0} 天</h2>
          <div className="hist-stats">
            <div className="stat">
              <span>近 7 天训练</span>
              <b>{stats.days} 天</b>
            </div>
            <div className="stat">
              <span>近 7 天组数</span>
              <b>{stats.sets} 组</b>
            </div>
            <div className="stat">
              <span>累计组数</span>
              <b>{totalSets} 组</b>
            </div>
            <div className="stat">
              <span>最常练</span>
              <b>{topName ?? '—'}</b>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>📅 {HEAT_WEEKS} 周热力图</h2>
          <div className="hm-wrap">
            <div className="hm-weekdays">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="heatmap">
              {cells.map((c) => (
                <div
                  key={c.date}
                  className={`hm hm-${levelOf(c.count)}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <div className="hm-legend">
            <span>少</span>
            <div className="hm hm-0" />
            <div className="hm hm-1" />
            <div className="hm hm-2" />
            <div className="hm hm-3" />
            <span>多</span>
          </div>
          {logs.length === 0 && (
            <p className="hm-empty">
              还没有训练记录。去
              <Link to="/" className="hm-link">
                动作库
              </Link>
              挑一个动作，点「跟练」开始第一次吧 💪
            </p>
          )}
        </section>

        <section className="panel">
          <h2>🕘 最近记录</h2>
          {recent.length === 0 ? (
            <p className="hm-empty">暂无记录</p>
          ) : (
            <ul className="recent-list">
              {recent.map((l, i) => {
                const ex = exercises.find((e) => e.id === l.exerciseId)
                return (
                  <li key={`${l.ts}-${i}`}>
                    <Link to={`/exercise/${l.exerciseId}`} className="recent-name">
                      {ex?.name ?? l.exerciseId}
                    </Link>
                    <span className="recent-meta">
                      {l.date} · {l.setsDone} 组{l.planId ? ' · 计划' : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {logs.length > 0 && (
            <div className="hm-clear">
              {confirming ? (
                <>
                  <span>确定清空全部本地记录？</span>
                  <button
                    className="tb-btn danger"
                    onClick={() => {
                      clearLogs()
                      setLogs([])
                      setConfirming(false)
                    }}
                  >
                    确认清空
                  </button>
                  <button className="tb-btn" onClick={() => setConfirming(false)}>
                    取消
                  </button>
                </>
              ) : (
                <button className="tb-btn" onClick={() => setConfirming(true)}>
                  清空记录
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
