import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import CharacterModel from './CharacterModel'
import { StudioLights } from './studioLook'
import { GROUP_COLOR } from '../lib/groupStyle'
import type { Exercise } from '../types'

/**
 * 卡片迷你 3D 画布：仅在悬停时由父组件挂载（单实例，离开即卸载）。
 * 模型加载完成后回调 onReady → 父组件把画布交叉淡入盖在海报上。
 */

/** 挂进 Suspense 里：组件出现即意味着模型已就绪 */
function ReadyMarker({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

export default function CardThumb3D({
  exercise,
  ready,
  onReady,
}: {
  exercise: Exercise
  /** true = 画布淡入（模型已就绪） */
  ready: boolean
  onReady: () => void
}) {
  /**
   * onClips 触发挂载后的重渲染（与 ModelViewer 同一模式）：
   * useAnimations 的 actions 是惰性 getter，首次渲染时 group ref 尚为 null，
   * 不重渲染一次 action 永远是 null（人物会停在 T-pose 不动）。
   */
  const [, setClipNames] = useState<string[]>([])
  /**
   * 外层 div 负责绝对定位 + 交叉淡入（.card-3dlayer）；
   * 不把定位类直接挂在 Canvas 上——R3F 的内联 position:relative 会覆盖类样式
   */
  return (
    <div className={`card-3dlayer ${ready ? 'on' : ''}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [2.25, 1.2, 2.65], fov: 40, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <StudioLights accent={GROUP_COLOR[exercise.muscle]} shadows={false} />
        <Suspense fallback={null}>
          <CharacterModel
            url={exercise.model.url}
            clip={exercise.model.clip}
            motionId={exercise.generated ? exercise.model.clip : undefined}
            playing
            speed={0.55}
            onClips={setClipNames}
          />
          <ReadyMarker onReady={onReady} />
        </Suspense>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={5}
          blur={2.4}
          far={3}
          resolution={256}
          color="#000000"
        />
        <OrbitControls
          makeDefault
          target={[0, 0.9, 0]}
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={2.6}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.55}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />
      </Canvas>
    </div>
  )
}
