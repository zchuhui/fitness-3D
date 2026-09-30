import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Grid, Html, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useRef } from 'react'
import CharacterModel from './CharacterModel'
import type { ErrorVariant, Exercise } from '../types'

/** 双画布各自独立的相机参数（低机位给俯卧/卧姿动作） */
const POS: [number, number, number] = [2.8, 1.5, 3.0]
const TARGET: [number, number, number] = [0, 0.95, 0]
const FLOOR_POS: [number, number, number] = [2.6, 1.4, 3.0]
const FLOOR_TARGET: [number, number, number] = [0, 0.35, 0]

/** 俯卧/卧姿类对比动作用低视角 */
const FLOOR_MOTIONS = new Set([
  'push-up',
  'plank',
  'bench-press',
  'push-up-x-sag',
  'plank-x-sag',
  'bench-press-x-flare',
  'sit-up',
  'crunch',
  'lying-leg-raise',
  'russian-twist',
])

function isFloor(motionId: string) {
  return FLOOR_MOTIONS.has(motionId)
}

interface StageProps {
  title: string
  tone: 'good' | 'bad'
  motionId: string
  playing: boolean
  speed: number
}

/** 单个对比画布：X Bot + 程序生成动作，独立旋转查看 */
function Stage({ title, tone, motionId, playing, speed }: StageProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const floor = isFloor(motionId)
  const pos = floor ? FLOOR_POS : POS
  const lookAt = floor ? FLOOR_TARGET : TARGET

  return (
    <div className={`cv-stage ${tone}`}>
      <div className={`cv-label ${tone}`}>{title}</div>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: pos, fov: 42 }}>
        <color attach="background" args={['#0d1017']} />
        <fog attach="fog" args={['#0d1017', 9, 18]} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
          {/* 双画布共用同一个 Xbot.glb，useGLTF 全局缓存只会加载一次 */}
          <CharacterModel url="/models/Xbot.glb" motionId={motionId} playing={playing} speed={speed} />
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
          enableDamping
          dampingFactor={0.08}
          minDistance={1.2}
          maxDistance={9}
          maxPolarAngle={Math.PI / 2 + 0.08}
        />
      </Canvas>
    </div>
  )
}

/**
 * 错误 vs 正确分屏对比：
 * 左侧标准动作、右侧错误变体，同一模型（X Bot）同步播放/倍速，
 * 两个画布都可独立旋转到相同角度逐帧对比。
 */
export default function CompareView({
  exercise,
  error,
  onExit,
  onSelectError,
}: {
  exercise: Exercise
  /** 当前演示的错误变体 */
  error: ErrorVariant
  /** 退出对比模式 */
  onExit: () => void
  /** 切换演示其他错误变体 */
  onSelectError?: (error: ErrorVariant) => void
}) {
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(0.5)

  const standardMotion = exercise.compareMotion ?? (exercise.generated ? exercise.model.clip : undefined)

  return (
    <div className="compare-wrap">
      <div className="cv-header">
        <span className="cv-title">
          对比模式 · {exercise.name}
        </span>
        <div className="cv-controls">
          {exercise.errors && exercise.errors.length > 1 && (
            <div className="cv-errors">
              {exercise.errors.map((e) => (
                <button
                  key={e.motionId}
                  className={`tb-btn ${e.motionId === error.motionId ? 'active' : ''}`}
                  onClick={() => onSelectError?.(e)}
                >
                  {e.label}
                </button>
              ))}
            </div>
          )}
          <button className="tb-btn primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <label className="tb-speed">
            速度
            <input
              type="range"
              min={0.25}
              max={1.5}
              step={0.25}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed}×</span>
          </label>
          <button className="tb-btn" onClick={onExit}>
            ✕ 退出对比
          </button>
        </div>
      </div>

      <div className="cv-grid">
        <Stage title="✅ 标准" tone="good" motionId={standardMotion ?? ''} playing={playing} speed={speed} />
        <Stage title={`❌ ${error.label}`} tone="bad" motionId={error.motionId} playing={playing} speed={speed} />
      </div>

      <div className="viewer-hint" style={{ position: 'static', marginTop: 10, textAlign: 'center' }}>
        左右画布各自可旋转 · 建议转到同一侧面视角、0.5× 慢放对比观看
      </div>
    </div>
  )
}
