/**
 * 本地训练日志：localStorage 持久化，纯前端零依赖。
 * 结构简单（单数组 JSON），数据量大不了，无需 IndexedDB。
 */

export interface TrainLogEntry {
  /** 'YYYY-MM-DD' 本地日期 */
  date: string
  /** 完成时间戳（毫秒） */
  ts: number
  exerciseId: string
  setsDone: number
  /** 单动作跟练 or 计划模板 */
  source: 'solo' | 'plan'
  planId?: string
}

const KEY = 'fitmotion-logs'

export function getLogs(): TrainLogEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function logSession(entry: Omit<TrainLogEntry, 'ts'>) {
  const logs = getLogs()
  logs.push({ ...entry, ts: Date.now() })
  try {
    localStorage.setItem(KEY, JSON.stringify(logs))
  } catch {
    // 存储满 / 隐私模式：静默失败，不影响训练流程
  }
}

export function clearLogs() {
  localStorage.removeItem(KEY)
}

/** 本地日期 → 'YYYY-MM-DD' */
export function dateKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export interface WeekStats {
  /** 本周训练天数 */
  days: number
  /** 本周完成总组数 */
  sets: number
  /** 最常练的动作 id（并列取最近） */
  topExerciseId?: string
}

/** 最近 7 天统计（含今天） */
export function statsRecent7(): WeekStats {
  const logs = getLogs()
  const since = Date.now() - 7 * 24 * 3600 * 1000
  const recent = logs.filter((l) => l.ts >= since)
  const days = new Set(recent.map((l) => l.date)).size
  const sets = recent.reduce((s, l) => s + l.setsDone, 0)
  const byId = new Map<string, number>()
  for (const l of recent) byId.set(l.exerciseId, (byId.get(l.exerciseId) ?? 0) + l.setsDone)
  let topExerciseId: string | undefined
  let max = 0
  for (const [id, n] of byId) {
    if (n > max) {
      max = n
      topExerciseId = id
    }
  }
  return { days, sets, topExerciseId }
}

/** 某天的完成组数（热力图用） */
export function setsByDate(): Map<string, number> {
  const m = new Map<string, number>()
  for (const l of getLogs()) m.set(l.date, (m.get(l.date) ?? 0) + l.setsDone)
  return m
}
