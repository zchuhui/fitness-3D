import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useGLTF } from '@react-three/drei'
import { DIFFICULTY_CLASS } from '../types'
import type { Exercise } from '../types'
import { GROUP_COLOR, GROUP_FALLBACK, posterUrl, posterUrlPng } from '../lib/groupStyle'
import { useTilt } from '../lib/useTilt'
import CardThumb3D from './CardThumb3D'

/**
 * 动作卡片 · 聚光灯舞台版：
 * - 默认态：3D 海报图（/poster-studio 预渲染）立在迷你舞台上——聚光锥 + 地面光斑 + 肌群色氛围
 * - 悬停态（桌面端精细指针 + 未开减少动效）：懒挂载实时 3D 画布，模型就绪后交叉淡入
 * - 降级链：webp 海报 → png 海报 → 渐变 + 图标
 * - 同屏最多一个实时画布：新卡片悬停时广播事件，其余卡片自动卸载
 */

/** 全屏仅允许一张卡片活着的实时 3D 画布 */
const CARD_3D_EVENT = 'fm-card-3d-open'

export default function ExerciseCard({ exercise: e }: { exercise: Exercise }) {
  const [hover, setHover] = useState(false)
  const [threeReady, setThreeReady] = useState(false)
  /** 海报降级链：webp → png → 彻底失败走图标兜底 */
  const [posterSrc, setPosterSrc] = useState(posterUrl(e.id))
  const [posterFailed, setPosterFailed] = useState(false)

  /** 桌面端精细指针 + 未开启"减少动效"才启用悬停 3D */
  const canHover3D = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current

  /** 3D 倾斜 + 光标追光坐标（--mx/--my/--mxn），内部同样有指针与动效护栏 */
  const { tiltRef, onTiltMove, onTiltLeave } = useTilt<HTMLAnchorElement>(5)

  const onMouseEnter = (_: MouseEvent) => {
    // 悬停预加载模型：点进详情页 / 悬停 3D 都秒开
    if (e.model.url.toLowerCase().endsWith('.glb')) useGLTF.preload(e.model.url)
    if (!canHover3D) return
    // 通知其它卡片卸载自己的实时画布（保证同屏单实例）
    window.dispatchEvent(new CustomEvent(CARD_3D_EVENT, { detail: e.id }))
    setHover(true)
  }

  const onMouseLeave = () => {
    onTiltLeave?.()
    setHover(false)
    setThreeReady(false)
  }

  // 其它卡片开始悬停 → 本卡片卸载实时画布
  useEffect(() => {
    const onOther = (ev: Event) => {
      if ((ev as CustomEvent).detail !== e.id) setHover(false)
    }
    window.addEventListener(CARD_3D_EVENT, onOther)
    return () => window.removeEventListener(CARD_3D_EVENT, onOther)
  }, [e.id])

  const onPosterError = () => {
    // 第一跳：webp 缺失 → 尝试 png；第二跳：彻底失败走图标兜底
    if (posterSrc === posterUrl(e.id)) setPosterSrc(posterUrlPng(e.id))
    else setPosterFailed(true)
  }

  const style = { '--grp': GROUP_COLOR[e.muscle] } as CSSProperties

  return (
    <Link
      ref={tiltRef}
      to={`/exercise/${e.id}`}
      className="card card-v2"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onTiltMove}
    >
      <div className="card-stage">
        <span className="card-spot" />
        <span className="card-floor" />
        {posterFailed ? (
          <span className="card-fallback" style={{ background: GROUP_FALLBACK[e.muscle].gradient }}>
            {GROUP_FALLBACK[e.muscle].icon}
          </span>
        ) : (
          <img
            className="card-poster"
            src={posterSrc}
            alt={`${e.name} 3D 姿势`}
            loading="lazy"
            onError={onPosterError}
          />
        )}
        {hover && canHover3D && (
          <CardThumb3D exercise={e} ready={threeReady} onReady={() => setThreeReady(true)} />
        )}
        <span className="card-live">LIVE 3D</span>
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
          <span className={`tag diff diff-${DIFFICULTY_CLASS[e.difficulty]}`}>
            <i className={`diff-dot dd-${DIFFICULTY_CLASS[e.difficulty]}`} />
            {e.difficulty}
          </span>
          <span className="tag">{e.equipment}</span>
        </div>
        <span className="card-cta">查看 3D 演示 →</span>
      </div>
    </Link>
  )
}
