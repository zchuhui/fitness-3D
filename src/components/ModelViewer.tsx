import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Html,
  OrbitControls,
} from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { m } from 'framer-motion'
import CharacterModel from './CharacterModel'
import { StagePool, StudioLights } from './studioLook'
import { LOOK_MODES, type LookMode } from '../lib/bodyRegions'
import { GROUP_COLOR } from '../lib/groupStyle'
import type { Exercise } from '../types'

/** 默认相机位置 */
const DEFAULT_POS: [number, number, number] = [2.6, 1.7, 3.2]
/** 视角环绕中心（人物胸口高度） */
const TARGET: [number, number, number] = [0, 0.95, 0]
/** 仰卧类动作的视线高度 */
const FLOOR_TARGET: [number, number, number] = [0, 0.32, 0]
const FLOOR_POS: [number, number, number] = [2.4, 1.45, 3.1]

/** 快捷视角预设 */
const VIEWS: { label: string; pos: [number, number, number] }[] = [
  { label: '正面', pos: [0, 1.3, 3.4] },
  { label: '侧面', pos: [3.4, 1.3, 0] },
  { label: '背面', pos: [0, 1.3, -3.4] },
  { label: '俯视', pos: [0, 4.6, 0.9] },
]

/**
 * 3D 动作查看器：
 * 左键拖拽旋转 / 滚轮缩放 / 右键平移，支持播放暂停、倍速、逐帧拖动时间轴、
 * 关键帧步进、一键切换正/侧/背/俯视角、自动旋转。
 * 快捷键：空格 = 播放/暂停，R = 重置视角，←/→ = 上/下一个关键帧。
 */
export default function ModelViewer({
  exercise,
  onActivePointChange,
  jumpRequest,
}: {
  exercise: Exercise
  /** 播放到某关键帧附近 / 跳转到关键帧时，联动高亮对应要点（传下标，null = 取消） */
  onActivePointChange?: (point: number | null) => void
  /** 外部跳帧请求（如点击侧栏要点）；n 每次自增以重复触发同一目标 */
  jumpRequest?: { at: number; point: number; n: number } | null
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [autoRotate, setAutoRotate] = useState(false)
  const [look, setLook] = useState<LookMode>('coach')
  const [clip, setClip] = useState<string | undefined>(exercise.model.clip)
  const [clipNames, setClipNames] = useState<string[]>([])
  const [duration, setDuration] = useState(0)
  /** 暂停态下钉住的时刻（秒）；播放中为 null */
  const [seek, setSeek] = useState<number | null>(null)
  /** CharacterModel 每帧写入当前动画时间，进度条据此直接操作 DOM，不走 React 状态 */
  const timeRef = useRef(0)
  const playheadRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const activePointRef = useRef<number | null>(null)

  const lookAt = exercise.camera === 'floor' ? FLOOR_TARGET : TARGET
  const defaultPos = exercise.camera === 'floor' ? FLOOR_POS : DEFAULT_POS

  const keyframes = useMemo(
    () => [...(exercise.keyframes ?? [])].sort((a, b) => a.at - b.at),
    [exercise.keyframes],
  )

  const setView = useCallback((pos: [number, number, number]) => {
    const c = controlsRef.current
    if (!c) return
    c.object.position.set(...pos)
    c.target.set(...lookAt)
    c.update()
  }, [lookAt])

  // 模型加载完成后拿到真实剪辑列表；若数据里配的剪辑名不存在则回退到第一个
  const onClips = useCallback((names: string[]) => {
    setClipNames(names)
    setClip((cur) => (cur && names.includes(cur) ? cur : names[0]))
  }, [])

  const onDuration = useCallback((d: number) => setDuration(d), [])

  const notifyPoint = useCallback(
    (point: number | null) => {
      if (activePointRef.current === point) return
      activePointRef.current = point
      onActivePointChange?.(point)
    },
    [onActivePointChange],
  )

  // 跳到归一化时刻 at（0-1），可选联动要点高亮
  const doJump = useCallback(
    (at: number, point?: number) => {
      const d = duration || 0
      setPlaying(false)
      setSeek(at * d)
      if (point !== undefined) notifyPoint(point)
    },
    [duration, notifyPoint],
  )

  // 上一个 / 下一个关键帧
  const step = useCallback(
    (dir: 1 | -1) => {
      const cur = playing ? timeRef.current : (seek ?? timeRef.current)
      const pct = duration > 0 ? cur / duration : 0
      const ats = keyframes.map((k) => k.at)
      const next =
        dir === 1
          ? ats.find((a) => a > pct + 0.02)
          : [...ats].reverse().find((a) => a < pct - 0.02)
      if (next === undefined) return
      const kf = keyframes.find((k) => k.at === next)
      if (kf) doJump(next, kf.point)
    },
    [playing, seek, duration, keyframes, doJump],
  )

  // 外部跳帧请求（点击侧栏要点等）
  useEffect(() => {
    if (jumpRequest) doJump(jumpRequest.at, jumpRequest.point)
  }, [jumpRequest, doJump])

  // 快捷键：空格播放/暂停，R 重置视角，←/→ 关键帧步进
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
      if (e.key === 'r' || e.key === 'R') setView(defaultPos)
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView, defaultPos, step])

  // rAF 循环：直接操作 DOM 更新进度条 / 时间标签，
  // 避免 60fps 的 setState 引发整棵树重渲染
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const d = duration || 1
      const cur = playing ? timeRef.current : (seek ?? timeRef.current)
      const pct = Math.min(1, cur / d)
      if (playheadRef.current) {
        playheadRef.current.style.left = `${(pct * 100).toFixed(2)}%`
      }
      if (labelRef.current) {
        labelRef.current.textContent = `${cur.toFixed(1)}s / ${d.toFixed(1)}s`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, seek, duration])

  // 暂停拖动时间轴：按指针位置换算归一化时刻
  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setPlaying(false)
    setSeek(frac * duration)
  }

  return (
    <div className="viewer-wrap">
      <div className="viewer-stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: defaultPos, fov: 42 }}>
        <color attach="background" args={['#0d1017']} />
        <fog attach="fog" args={['#0d1017', 9, 18]} />

        <StudioLights accent={GROUP_COLOR[exercise.muscle]} shadowMap={2048} />

        <Suspense
          fallback={
            <Html center>
              <div className="viewer-loading">
                <span className="spinner" />
                加载 3D 模型…
              </div>
            </Html>
          }
        >
          <CharacterModel
            url={exercise.model.url}
            clip={clip}
            playing={playing}
            speed={speed}
            onClips={onClips}
            onDuration={onDuration}
            timeRef={timeRef}
            time={playing ? undefined : (seek ?? undefined)}
            motionId={exercise.generated ? exercise.model.clip : undefined}
            muscle={exercise.muscle}
            look={look}
            accent={GROUP_COLOR[exercise.muscle]}
            duration={duration}
            keyframes={keyframes.map((k) => k.at)}
          />
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.55}
          scale={9}
          blur={2.2}
          far={4.5}
          resolution={512}
          color="#000000"
        />
        <StagePool color={GROUP_COLOR[exercise.muscle]} />
        <Grid
          position={[0, 0.01, 0]}
          args={[12, 12]}
          cellSize={0.5}
          cellColor="#1d2436"
          sectionSize={2.5}
          sectionColor="#2e3c5c"
          fadeDistance={14}
          fadeStrength={2.5}
          infiniteGrid
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={lookAt}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={9}
          maxPolarAngle={Math.PI / 2 + 0.08}
        />

        <GizmoHelper alignment="bottom-right" margin={[18, 18]}>
          <GizmoViewport axisColors={['#f87171', '#4ade80', '#60a5fa']} labelColor="#e8ecf4" />
        </GizmoHelper>
      </Canvas>

      {/* HUD 角标栈：左上角统一收纳操作提示与数据徽标 */}
      <div className="hud-stack">
        <div className="viewer-hint">左键旋转 · 滚轮缩放 · 右键平移 · 空格播放/暂停 · ←→ 关键帧</div>
        {exercise.placeholder && (
          <div className="viewer-badge">当前为占位演示动画，可替换为 Mixamo 标准动作</div>
        )}
        {exercise.generated && (
          <div className="viewer-badge gen">程序生成的标准动作，可旋转查看关节轨迹</div>
        )}
      </div>

      </div>

      {/* 操作台放在画布下方，避免挡住贴地动作 */}
      <m.div
        className="viewer-dock"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        {/* 时间轴：拖动逐帧查看，圆点为关键帧，点击跳转并联动右侧要点 */}
        <div className="timeline">
        <button
          className="tb-btn"
          onClick={() => step(-1)}
          disabled={keyframes.length === 0}
          title="上一个关键帧（←）"
        >
          ⏮
        </button>
        <div
          className="tl-track"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            scrub(e)
          }}
          onPointerMove={(e) => {
            if (e.buttons > 0) scrub(e)
          }}
        >
          <div className="tl-progress" ref={playheadRef} />
          {keyframes.map((k, i) => (
            <button
              key={i}
              className="tl-dot"
              style={{ left: `${k.at * 100}%` }}
              onClick={(e) => {
                e.stopPropagation()
                doJump(k.at, k.point)
              }}
              title={exercise.keyPoints[k.point]}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          className="tb-btn"
          onClick={() => step(1)}
          disabled={keyframes.length === 0}
          title="下一个关键帧（→）"
        >
          ⏭
        </button>
        <span className="tl-label" ref={labelRef}>
          0.0s / 0.0s
        </span>
      </div>

      <div className="viewer-toolbar">
        <button
          className="tb-btn primary play-toggle"
          onClick={() => setPlaying((p) => !p)}
          title="播放/暂停（空格）"
        >
          {playing ? '⏸' : '▶'}
        </button>

        <label className="tb-speed">
          速度
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.25}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}×</span>
        </label>

        {clipNames.length > 1 && (
          <select
            className="tb-select"
            value={clip ?? ''}
            onChange={(e) => setClip(e.target.value)}
            title="选择动画剪辑"
          >
            {clipNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}

        <span className="tb-divider" />

        {LOOK_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`tb-btn ${look === mode.id ? 'active' : ''}`}
            onClick={() => setLook(mode.id)}
            title={
              mode.id === 'coach'
                ? '目标肌群呼吸高亮'
                : mode.id === 'anatomy'
                  ? '半透明身体 + 胶囊骨架'
                  : '手足髋轨迹与关节角度'
            }
          >
            {mode.label}
          </button>
        ))}

        <span className="tb-divider" />

        {VIEWS.map((v) => (
          <button key={v.label} className="tb-btn" onClick={() => setView(v.pos)}>
            {v.label}
          </button>
        ))}
        <button className="tb-btn" onClick={() => setView(defaultPos)} title="快捷键 R">
          ⟲ 重置
        </button>
        <button
          className={`tb-btn ${autoRotate ? 'active' : ''}`}
          onClick={() => setAutoRotate((a) => !a)}
        >
          自动旋转
        </button>
        </div>
      </m.div>
    </div>
  )
}
