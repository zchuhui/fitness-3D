import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import CharacterModel from '../components/CharacterModel'
import { StudioLights } from '../components/studioLook'
import { exercises } from '../data/exercises'
import { GROUP_COLOR } from '../lib/groupStyle'
import type { Exercise } from '../types'

/**
 * 海报渲染工作台（dev 专用，隐藏路由 /poster-studio）：
 * 逐个加载动作模型 → 钉在招牌姿势 → 离屏截图（透明底 + 肌群色轮廓光）
 * → POST /__save-poster 保存到 public/posters/。
 * 跑完后卡片首图全部成为静态资产，运行时零 3D 成本。
 */

/** 招牌姿势：显式 posterAt > 关键帧中间一帧 > 0.4 */
function posterAtOf(e: Exercise): number {
  if (e.posterAt != null) return e.posterAt
  const kfs = e.keyframes ?? []
  if (kfs.length > 0) return kfs[Math.min(Math.floor(kfs.length / 2), kfs.length - 1)].at
  return 0.4
}

/** 模型加载失败兜底：跳过该动作，不让整条流水线崩掉 */
class ShotErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function PosterShot({
  exercise,
  onCapture,
  onError,
}: {
  exercise: Exercise
  onCapture: (dataUrl: string) => void
  onError: () => void
}) {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const [duration, setDuration] = useState(0)
  /**
   * onClips 触发挂载后的重渲染（与 ModelViewer 同一模式）：
   * useAnimations 的 actions 是惰性 getter，首次渲染时 group ref 尚为 null，
   * 不重渲染一次 action 永远是 null（模型停在 T-pose、onDuration 也不会触发）。
   */
  const [, setClipNames] = useState<string[]>([])
  const floor = exercise.camera === 'floor'

  const onDuration = useCallback(
    (d: number) => {
      console.debug('[poster] duration', exercise.id, d)
      setDuration(d)
    },
    [exercise.id],
  )

  // 统一 3/4 侧视角；贴地动作视线放低
  useEffect(() => {
    camera.position.set(2.35, floor ? 1.7 : 1.25, 2.75)
    camera.lookAt(0, floor ? 0.42 : 0.9, 0)
  }, [camera, floor])

  // 时长已知 + 姿势钉住后，等淡入完成（fadeIn 0.25s 由 mixer 时钟驱动）
  // 再等两帧确保像素上屏，然后截图
  useEffect(() => {
    if (duration <= 0) return
    let n = 2
    let raf = 0
    const timer = setTimeout(() => {
      const tick = () => {
        n -= 1
        if (n > 0) {
          raf = requestAnimationFrame(tick)
          return
        }
        let url: string
        try {
          url = gl.domElement.toDataURL('image/webp', 0.92)
        } catch {
          url = gl.domElement.toDataURL('image/png')
        }
        console.debug('[poster] capture', exercise.id, url.length)
        onCapture(url)
      }
      raf = requestAnimationFrame(tick)
    }, 700)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [duration, gl, onCapture])

  return (
    <>
      <StudioLights accent={GROUP_COLOR[exercise.muscle]} shadows={false} />
      <ShotErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <CharacterModel
            url={exercise.model.url}
            clip={exercise.model.clip}
            motionId={exercise.generated ? exercise.model.clip : undefined}
            muscle={exercise.muscle}
            accent={GROUP_COLOR[exercise.muscle]}
            playing={false}
            speed={1}
            time={duration > 0 ? posterAtOf(exercise) * duration : undefined}
            onClips={setClipNames}
            onDuration={onDuration}
          />
        </Suspense>
      </ShotErrorBoundary>
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.42}
        scale={5}
        blur={2.4}
        far={3}
        resolution={256}
        color="#000000"
      />
    </>
  )
}

interface LogItem {
  id: string
  name: string
  ok: boolean
  file?: string
}

export default function PosterStudio() {
  const [idx, setIdx] = useState(exercises.length) // 初始停在"未开始"
  const [log, setLog] = useState<LogItem[]>([])
  const [running, setRunning] = useState(false)
  /** 正在保存的动作 id，防同一动作重复截图入列 */
  const inflightRef = useRef<string | null>(null)

  const current = idx < exercises.length ? exercises[idx] : null
  const total = exercises.length
  const done = Math.min(idx, total)

  const advance = useCallback((id: string, name: string, ok: boolean, file?: string) => {
    setLog((l) => (l.some((x) => x.id === id) ? l : [...l, { id, name, ok, file }]))
    setIdx((i) => Math.min(i + 1, total))
    if (Math.min(idx + 1, total) >= total) setRunning(false)
  }, [idx, total])

  const handleCapture = useCallback(
    (dataUrl: string) => {
      if (!current) return
      const { id, name } = current
      console.debug('[poster] handleCapture', id, 'inflight=', inflightRef.current)
      if (inflightRef.current === id) return
      inflightRef.current = id
      ;(async () => {
        let ok = false
        let file: string | undefined
        try {
          const r = await fetch('/__save-poster', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id, dataUrl }),
          })
          const j = (await r.json()) as { ok: boolean; file?: string }
          ok = !!j.ok
          file = j.file
        } catch {
          ok = false
        }
        advance(id, name, ok, file)
      })()
    },
    [current, advance],
  )

  const handleError = useCallback(() => {
    if (!current) return
    if (inflightRef.current === current.id) return
    inflightRef.current = current.id
    advance(current.id, current.name, false)
  }, [current, advance])

  const start = () => {
    inflightRef.current = null
    setLog([])
    setIdx(0)
    setRunning(true)
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>海报渲染工作台</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, margin: '0 0 18px' }}>
        逐个加载动作模型，钉在招牌姿势离屏截图（640×800 透明底 + 肌群色轮廓光），保存到{' '}
        <code>public/posters/</code>。跑完后卡片首图即静态资产，运行时零 3D 成本。
        截图透明底可透过 CSS 舞台背景看到聚光效果。
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <button className="tb-btn primary" onClick={start} disabled={running}>
          生成全部（{total}）
        </button>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          进度 {done} / {total}
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 140,
            height: 6,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${total ? (done / total) * 100 : 0}%`,
              height: '100%',
              background: 'var(--accent)',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* 渲染画布：640×800 缓冲区，视觉上缩放一半便于观察 */}
        <div
          style={{
            width: 640,
            height: 800,
            flex: 'none',
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            marginBottom: -400,
            borderRadius: 16,
            border: '1px solid var(--border)',
            overflow: 'hidden',
            background:
              'radial-gradient(115% 95% at 50% -12%, rgba(184,241,53,0.10), transparent 62%), linear-gradient(180deg,#151a25,#0f131c)',
          }}
        >
          {running && current && (
            <Canvas
              dpr={1}
              frameloop="always"
              camera={{ position: [2.35, 1.25, 2.75], fov: 34, near: 0.1, far: 60 }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
              onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
            >
              <PosterShot
                key={current.id}
                exercise={current}
                onCapture={handleCapture}
                onError={handleError}
              />
            </Canvas>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ fontSize: 15, margin: '0 0 10px' }}>输出日志</h2>
          {log.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>点击「生成全部」开始。</p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
            {log.map((l) => (
              <li
                key={l.id}
                style={{
                  fontSize: 12.5,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: `1px solid ${l.ok ? 'rgba(184,241,53,0.35)' : 'rgba(248,113,113,0.4)'}`,
                  color: l.ok ? 'var(--text)' : '#fca5a5',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <span>
                  {l.ok ? '✔' : '✕'} {l.name}
                </span>
                <span style={{ color: 'var(--muted)' }}>{l.file ?? '失败'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
