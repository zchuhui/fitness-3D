import { Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Group, PerspectiveCamera } from 'three'
import CharacterModel from './CharacterModel'
import { StudioLights } from './studioLook'
import { GROUP_COLOR } from '../lib/groupStyle'
import { COVER_FOV, frameCover, posterAtOf, type CoverView } from '../lib/posterFrame'
import type { Exercise } from '../types'

/**
 * 卡片迷你 3D 画布：仅在悬停时由父组件挂载（单实例，离开即卸载）。
 * 先钉在和海报相同的招牌姿势、用同一套贴地取景，交叉淡入后再开播，
 * 避免人物从绑定姿势塌下来，或相对封面跳一截。
 */

function CoverCamera({
  armed,
  root,
  view,
  onFramed,
}: {
  armed: boolean
  root: RefObject<Group>
  view?: CoverView
  onFramed: (target: [number, number, number]) => void
}) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const step = useRef(0)
  const done = useRef(false)

  useFrame(() => {
    if (!armed || done.current || !root.current) return
    step.current += 1
    if (step.current < 3) return
    done.current = true
    const target = frameCover(camera as PerspectiveCamera, root.current, size.width / Math.max(size.height, 1), view)
    onFramed(target)
  })

  return null
}

export default function CardThumb3D({
  exercise,
  ready,
  onReady,
}: {
  exercise: Exercise
  /** true = 画布淡入（取景完成） */
  ready: boolean
  onReady: () => void
}) {
  /**
   * onClips 触发挂载后的重渲染（与 ModelViewer 同一模式）：
   * useAnimations 的 actions 是惰性 getter，首次渲染时 group ref 尚为 null，
   * 不重渲染一次 action 永远是 null（人物会停在 T-pose 不动）。
   */
  const [, setClipNames] = useState<string[]>([])
  const [duration, setDuration] = useState(0)
  /** 淡入完成前先停在招牌姿势，和海报对齐；之后再接着播 */
  const [play, setPlay] = useState(false)
  const [target, setTarget] = useState<[number, number, number] | null>(null)
  const root = useRef<Group>(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    if (!target) return
    onReadyRef.current()
    const timer = window.setTimeout(() => setPlay(true), 360)
    return () => window.clearTimeout(timer)
  }, [target])

  return (
    <div className={`card-3dlayer ${ready ? 'on' : ''}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [2.4, 1.3, 2.7], fov: COVER_FOV, near: 0.05, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <StudioLights accent={GROUP_COLOR[exercise.muscle]} shadows={false} />
        <Suspense fallback={null}>
          <group ref={root}>
            <CharacterModel
              url={exercise.model.url}
              clip={exercise.model.clip}
              motionId={exercise.generated ? exercise.model.clip : undefined}
              playing={play}
              blend={0}
              speed={0.55}
              time={duration > 0 ? posterAtOf(exercise) * duration : undefined}
              onClips={setClipNames}
              onDuration={setDuration}
              muscle={exercise.muscle}
              accent={GROUP_COLOR[exercise.muscle]}
            />
          </group>
        </Suspense>
        <CoverCamera
          armed={duration > 0}
          root={root}
          view={exercise.posterView}
          onFramed={setTarget}
        />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.45}
          scale={5}
          blur={2.4}
          far={3}
          resolution={256}
          color="#000000"
        />
        {target && (
          <OrbitControls
            makeDefault
            target={target}
            enableZoom={false}
            enablePan={false}
            autoRotate={play}
            autoRotateSpeed={2.2}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={0.4}
            maxPolarAngle={Math.PI / 2 + 0.15}
          />
        )}
      </Canvas>
    </div>
  )
}
