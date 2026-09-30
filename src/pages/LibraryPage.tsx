import { useMemo, useState } from 'react'
import ExerciseCard from '../components/ExerciseCard'
import { exercises } from '../data/exercises'
import type { MuscleGroup } from '../types'

const GROUPS: ('全部' | MuscleGroup)[] = [
  '全部',
  '胸部',
  '背部',
  '腿部',
  '肩部',
  '手臂',
  '核心',
  '全身',
]

export default function LibraryPage() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('全部')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return exercises.filter(
      (e) =>
        (group === '全部' || e.muscle === group) &&
        (kw === '' || e.name.includes(kw) || e.nameEn.toLowerCase().includes(kw)),
    )
  }, [group, q])

  return (
    <div className="page">
      <section className="hero">
        <h1>
          标准动作，<em>360°</em> 看清每个细节
        </h1>
        <p>3D 交互式健身动作库 · 自由旋转、缩放，从任意角度学习标准姿势</p>
        <div className="hero-stats">
          <span>
            <b>{exercises.length}</b> 个动作
          </span>
          <span>
            <b>{GROUPS.length - 1}</b> 大肌群
          </span>
          <span>
            <b>360°</b> 自由视角
          </span>
        </div>
      </section>

      <div className="filters">
        <div className="chips">
          {GROUPS.map((g) => (
            <button
              key={g}
              className={`chip ${group === g ? 'active' : ''}`}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="搜索动作，如：深蹲 / squat"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {list.length > 0 ? (
        <div className="grid">
          {list.map((e) => (
            <ExerciseCard key={e.id} exercise={e} />
          ))}
        </div>
      ) : (
        <div className="empty">没有找到匹配的动作，换个关键词试试 🏃</div>
      )}

      <section className="howto" id="howto">
        <h2>➕ 如何添加真实标准动作（Mixamo）</h2>
        <p className="howto-sub">
          带「生成演示」的动作按标准关节角度直接生成，可以旋转着看。若要换成 Mixamo 动作捕捉，按下面几步替换对应文件：
        </p>
        <ol className="howto-steps">
          <li>
            <b>打开 Mixamo</b>
            <span>
              访问 <code>mixamo.com</code>，用 Adobe 账号免费登录，选择角色（推荐 Y Bot / X Bot）
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
      </section>
    </div>
  )
}
