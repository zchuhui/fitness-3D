import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
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
import CharacterModel from './CharacterModel'
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
 * 左键拖拽旋转 / 滚轮缩放 / 右键平移，支持播放暂停、倍速、
 * 一键切换正/侧/背/俯视角、自动旋转。
 * 快捷键：空格 = 播放/暂停，R = 重置视角。
 */
export default function ModelViewer({ exercise }: { exercise: Exercise }) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [autoRotate, setAutoRotate] = useState(false)
  const [clip, setClip] = useState<string | undefined>(exercise.model.clip)
  const [clipNames, setClipNames] = useState<string[]>([])
  const lookAt = exercise.camera === 'floor' ? FLOOR_TARGET : TARGET
  const defaultPos = exercise.camera === 'floor' ? FLOOR_POS : DEFAULT_POS

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

  // 快捷键：空格播放/暂停，R 重置视角
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
      if (e.key === 'r' || e.key === 'R') setView(defaultPos)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView, defaultPos])

  return (
    <div className="viewer-wrap">
      <Canvas shadows dpr={[1, 2]} camera={{ position: defaultPos, fov: 42 }}>
        <color attach="background" args={['#0d1017']} />
        <fog attach="fog" args={['#0d1017', 9, 18]} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={6}
          shadow-camera-bottom={-2}
          shadow-camera-far={20}
        />
        <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#9db8ff" />

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
            motionId={exercise.generated ? exercise.model.clip : undefined}
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

        <GizmoHelper alignment="bottom-right" margin={[64, 64]}>
          <GizmoViewport axisColors={['#f87171', '#4ade80', '#60a5fa']} labelColor="#e8ecf4" />
        </GizmoHelper>
      </Canvas>

      <div className="viewer-hint">左键旋转 · 滚轮缩放 · 右键平移 · 空格播放/暂停</div>
      {exercise.placeholder && (
        <div className="viewer-badge">当前为占位演示动画，可替换为 Mixamo 标准动作</div>
      )}
      {exercise.generated && (
        <div className="viewer-badge gen">程序生成的标准动作，可旋转查看关节轨迹</div>
      )}

      <div className="viewer-toolbar">
        <button className="tb-btn primary" onClick={() => setPlaying((p) => !p)}>
          {playing ? '⏸ 暂停' : '▶ 播放'}
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
    </div>
  )
}
