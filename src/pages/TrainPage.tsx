import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import FollowAlongPanel from '../components/FollowAlong'
import { exercises } from '../data/exercises'
import { dateKey, logSession } from '../lib/storage'
import { DIFFICULTY_CLASS } from '../types'

/**
 * 单动作跟练页 /train/:id
 * 完成后把成绩写入本地训练日志
 */
export default function TrainPage() {
  const { id } = useParams()
  const exercise = exercises.find((e) => e.id === id)
  const [saved, setSaved] = useState(false)

  const handleFinish = useCallback(
    (setsDone: number) => {
      if (!exercise) return
      logSession({
        date: dateKey(),
        exerciseId: exercise.id,
        setsDone,
        source: 'solo',
      })
      setSaved(true)
    },
    [exercise],
  )

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

  return (
    <div className="page detail">
      <Link to={`/exercise/${exercise.id}`} className="back">
        ← 返回动作详情
      </Link>

      <header className="detail-header">
        <div>
          <h1>
            跟练 · {exercise.name}
            <span className="en">{exercise.nameEn}</span>
          </h1>
          <p className="desc">{exercise.description}</p>
        </div>
        <div className="detail-badges">
          <span className="tag">{exercise.muscle}</span>
          <span className={`tag diff-${DIFFICULTY_CLASS[exercise.difficulty]}`}>{exercise.difficulty}</span>
          <span className="tag">{exercise.equipment}</span>
        </div>
      </header>

      {saved && <div className="save-toast">✅ 本次训练已写入训练日志，去「训练历史」看看你的坚持</div>}

      <FollowAlongPanel key={exercise.id} exercise={exercise} onFinish={handleFinish} />
    </div>
  )
}
