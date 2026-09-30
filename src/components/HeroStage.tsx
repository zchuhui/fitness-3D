import { Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Grid, Html, OrbitControls } from '@react-three/drei'
import CharacterModel from './CharacterModel'
import { StagePool, StudioLights } from './studioLook'
import { exercises } from '../data/exercises'
import { PLANS } from '../data/plans'

/** Hero 主打动作：真实动捕的杠铃深蹲 */
const HERO_EXERCISE = exercises.find((e) => e.id === 'squat')!

/**
 * 首页 Hero：左文案 + 右 3D 主舞台。
 * 舞台复用 CharacterModel 渲染动捕深蹲：三灯布光 + 接触阴影 + 细网格地面，
 * 缓慢自动旋转、可拖拽（禁缩放平移保持构图）；离屏自动暂停渲染省电。
 */
export default function HeroStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  /**
   * onClips 触发挂载后的重渲染（与 ModelViewer 同一模式）：
   * useAnimations 的 actions 是惰性 getter，首次渲染时 group ref 尚为 null，
   * 不重渲染一次 action 永远是 null（人物会停在 T-pose 不动）。
   */
  const [, setClipNames] = useState<string[]>([])

  // 离屏暂停渲染（frameloop 切 never），回屏恢复
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="home-hero">
      <div className="hero-copy">
        <span className="hero-eyebrow">
          <i />
          FitMotion 3D · 动作捕捉库
        </span>
        <h1>
          标准动作，<em>360°</em>
          <br />
          看清每个细节
        </h1>
        <p className="hero-lede">
          不再对着平面图猜角度。每个动作都是真实动捕数据驱动的 3D 演示——自由旋转、逐帧拆解、
          错误对比、跟练计时，把「练对」这件事交给眼睛。
        </p>
        <div className="hero-cta">
          <Link to={`/plan/${PLANS[3].id}`} className="cta-solid">
            开始跟练
          </Link>
          <a href="#library" className="cta-ghost">
            浏览动作库
          </a>
        </div>
        <div className="hero-stats-v2">
          <span className="hero-stat">
            <b>{exercises.length}</b>
            <span>个动作</span>
          </span>
          <span className="hero-stat">
            <b>7</b>
            <span>大肌群</span>
          </span>
          <span className="hero-stat">
            <b>5</b>
            <span>套训练计划</span>
          </span>
        </div>
      </div>

      <div className="hero-stage" ref={wrapRef}>
        <div className="hero-halo" />
        {/* 外层 div 负责绝对定位铺满舞台；R3F 内联 position:relative 不能被类覆盖 */}
        <div className="hero-stage-canvas">
          <Canvas
            shadows
            dpr={[1, 1.75]}
            frameloop={active ? 'always' : 'never'}
            camera={{ position: [2.8, 1.55, 3.4], fov: 38, near: 0.1, far: 60 }}
          >
          <StudioLights />

          <Suspense
            fallback={
              <Html center>
                <div className="stage-loading">
                  <span className="spinner" />
                  加载动捕模型…
                </div>
              </Html>
            }
          >
            <CharacterModel url={HERO_EXERCISE.model.url} playing speed={0.62} onClips={setClipNames} />
          </Suspense>

          <StagePool />
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.55}
            scale={8}
            blur={2.2}
            far={4.5}
            resolution={512}
            color="#000000"
          />
          <Grid
            position={[0, 0.01, 0]}
            args={[12, 12]}
            cellSize={0.5}
            cellColor="#1c2333"
            sectionSize={2.5}
            sectionColor="#2b3852"
            fadeDistance={11}
            fadeStrength={2.2}
            infiniteGrid
          />

          <OrbitControls
            makeDefault
            target={[0, 0.95, 0]}
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.7}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={0.5}
            maxPolarAngle={Math.PI / 2 + 0.06}
          />
          </Canvas>
        </div>

        <span className="stage-chip sc-1">360° 自由视角</span>
        <span className="stage-chip sc-2">真实动作捕捉</span>
        <span className="stage-chip sc-3">关键帧教学</span>
        <span className="stage-caption">Back Squat · Motion Capture</span>
      </div>
    </section>
  )
}
