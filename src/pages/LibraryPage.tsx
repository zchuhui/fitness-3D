import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ExerciseCard from '../components/ExerciseCard'
import HeroStage from '../components/HeroStage'
import Reveal from '../components/Reveal'
import { exercises } from '../data/exercises'
import { PLANS } from '../data/plans'
import type { MuscleGroup } from '../types'

const GROUPS: ('全部' | MuscleGroup)[] = ['全部', '胸部', '背部', '腿部', '肩部', '手臂', '核心', '全身']

export default function LibraryPage() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('全部')
  const [q, setQ] = useState('')
  /** 居家自重专区：只看无器械动作 */
  const [homeOnly, setHomeOnly] = useState(false)

  /** 各肌群动作数：筛选 chip 角标 */
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of exercises) m.set(e.muscle, (m.get(e.muscle) ?? 0) + 1)
    return m
  }, [])

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (group === '全部' || e.muscle === group) &&
        (!homeOnly || e.equipment.includes('自重')) &&
        (kw === '' || e.name.includes(kw) || e.nameEn.toLowerCase().includes(kw)),
    )
  }, [group, q, homeOnly])

  return (
    <div className="page">
      <HeroStage />

      {/* ---------- 01 动作库 ---------- */}
      <section id="library">
        <div className="sec-head">
          <span className="sec-index">01</span>
          <h2>动作库</h2>
          <span className="sec-line" />
          <span className="sec-sub">{list.length} 个动作</span>
        </div>

        <div className="filters">
          <div className="chips">
            {GROUPS.map((g) => (
              <button
                key={g}
                className={`chip ${group === g ? 'active' : ''}`}
                onClick={() => setGroup(g)}
              >
                {g}
                <span className="cnt">{g === '全部' ? exercises.length : (counts.get(g) ?? 0)}</span>
              </button>
            ))}
            <span className="chip-divider" />
            <button
              className={`chip home ${homeOnly ? 'active' : ''}`}
              onClick={() => setHomeOnly((h) => !h)}
              title="只看不需要器械的动作"
            >
              居家自重
              <span className="cnt">
                {exercises.filter((e) => e.equipment.includes('自重')).length}
              </span>
            </button>
          </div>
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              className="search"
              placeholder="搜索动作，如：深蹲 / squat"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {list.length > 0 ? (
          <div className="grid">
            {list.map((e, i) => (
              <Reveal key={e.id} delay={Math.min(i, 8) * 45}>
                <ExerciseCard exercise={e} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="empty">没有找到匹配的动作，换个关键词试试 🏃</div>
        )}
      </section>

      {/* ---------- 02 训练计划 ---------- */}
      <section className="plans" id="plans">
        <div className="sec-head">
          <span className="sec-index">02</span>
          <h2>训练计划</h2>
          <span className="sec-line" />
          <span className="sec-sub">动作串成套，跟着 3D 节拍整套练</span>
        </div>
        <div className="plans-grid">
          {PLANS.map((p) => (
            <Link to={`/plan/${p.id}`} key={p.id} className="plan-card">
              <div className="plan-tag">{p.tag}</div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="plan-meta">
                <span>{p.exerciseIds.length} 个动作</span>
                <span className="plan-go">开始跟练 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- 03 动作捕捉指南 ---------- */}
      <section id="howto">
        <div className="sec-head">
          <span className="sec-index">03</span>
          <h2>如何添加真实标准动作</h2>
          <span className="sec-line" />
          <span className="sec-sub">Mixamo</span>
        </div>
        <div className="howto">
          <p className="howto-sub">
            带「生成演示」的动作按标准关节角度直接生成，可以旋转着看。若要换成 Mixamo
            动作捕捉，按下面几步替换对应文件：
          </p>
          <ol className="howto-steps">
            <li>
              <b>打开 Mixamo</b>
              <span>
                访问 <code>mixamo.com</code>，用 Adobe 账号免费登录，选择角色（推荐 Y Bot / X
                Bot）
              </span>
            </li>
            <li>
              <b>搜索动作</b>
              <span>
                输入动作英文名，如 Squat、Push Up、Burpee、Plank，预览满意后点{' '}
                <code>Download</code>
              </span>
            </li>
            <li>
              <b>下载设置</b>
              <span>
                格式选 <code>FBX Binary</code>，勾选 <code>With Skin</code>，下载后放入项目的{' '}
                <code>public/models/</code> 目录
              </span>
            </li>
            <li>
              <b>更新数据</b>
              <span>
                在 <code>src/data/exercises.ts</code> 中把对应动作的 <code>model.url</code>{' '}
                改为新文件名，并把 <code>placeholder</code> 设为 <code>false</code>
              </span>
            </li>
          </ol>
          <p className="howto-tip">
            💡 提示：FBX 可直接使用，查看器同时支持 GLB / FBX
            两种格式；若想文件更小，可用 Blender 打开 FBX 后导出为 GLB（glTF Binary）。
          </p>
        </div>
      </section>
    </div>
  )
}
