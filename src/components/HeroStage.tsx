import { Suspense, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Grid, Html, OrbitControls } from '@react-three/drei'
import { m, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import type { Group } from 'three'
import CharacterModel from './CharacterModel'
import MouseGlow from './MouseGlow'
import { StagePool, StudioLights } from './studioLook'
import { exercises } from '../data/exercises'
import { PLANS } from '../data/plans'
import { lenis } from '../lib/smoothScroll'

/** Hero 主打动作：真实动捕的杠铃深蹲 */
const HERO_EXERCISE = exercises.find((e) => e.id === 'squat')!

/** 编排统一曲线：spring 感 cubic-bezier */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** 人物随鼠标轻微转身（每帧 lerp 平滑），像被目光唤醒 */
function TurnRig({ mx, children }: { mx: MotionValue<number>; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const target = mx.get() * 0.14
    g.rotation.y += (target - g.rotation.y) * 0.06
  })
  return <group ref={ref}>{children}</group>
}

/**
 * 首页 Hero：左文案 + 右 3D 主舞台 · 开场演出版。
 * - 入场编排：eyebrow → 标题逐行掩码滑出 → lede/CTA/stats stagger → 舞台浮现 → 胶囊弹入
 * - 鼠标视差：舞台整体位移 + halo 反向漂移 + 人物转身跟随（仅精细指针）
 * - 舞台复用 CharacterModel 渲染动捕深蹲：三灯布光 + 接触阴影 + 细网格地面，
 *   缓慢自动旋转、可拖拽（禁缩放平移保持构图）；离屏自动暂停渲染省电。
 */
export default function HeroStage() {
  const heroRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(true)
  /**
   * onClips 触发挂载后的重渲染（与 ModelViewer 同一模式）：
   * useAnimations 的 actions 是惰性 getter，首次渲染时 group ref 尚为 null，
   * 不重渲染一次 action 永远是 null（人物会停在 T-pose 不动）。
   */
  const [, setClipNames] = useState<string[]>([])

  /** 精细指针 + 非减少动效才开鼠标视差 */
  const fine = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current

  // 鼠标视差：归一化 -1 ~ 1，弹簧平滑后分发给舞台 / halo / 人物转身
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 55, damping: 16, mass: 0.7 })
  const smy = useSpring(my, { stiffness: 55, damping: 16, mass: 0.7 })
  const stageX = useTransform(smx, [-1, 1], [-10, 10])
  const stageY = useTransform(smy, [-1, 1], [-7, 7])
  const haloX = useTransform(smx, [-1, 1], [16, -16])
  const haloY = useTransform(smy, [-1, 1], [10, -10])

  // 离屏暂停渲染（frameloop 切 never），回屏恢复
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const onHeroMove = (e: MouseEvent) => {
    if (!fine) return
    const el = heroRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    my.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  /** 「浏览动作库」锚点：走 lenis 保持平滑手感一致 */
  const scrollToLibrary = (e: MouseEvent) => {
    const target = document.querySelector('#library')
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -76 })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  /** 统一的浮现动画参数 */
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: EASE, delay },
  })

  return (
    <section className="home-hero" ref={heroRef} onMouseMove={onHeroMove}>
      <span className="hero-bgword" aria-hidden="true">
        SQUAT
      </span>
      <MouseGlow containerRef={heroRef} />

      <div className="hero-copy">
        <m.span className="hero-eyebrow" {...rise(0.05)}>
          <i />
          FitMotion 3D · 动作捕捉库
        </m.span>
        <h1>
          <span className="h1-line">
            <m.span
              initial={{ y: '112%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.18 }}
            >
              标准动作，<em>360°</em>
            </m.span>
          </span>
          <span className="h1-line">
            <m.span
              initial={{ y: '112%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.3 }}
            >
              看清每个细节
            </m.span>
          </span>
        </h1>
        <m.p className="hero-lede" {...rise(0.44)}>
          不再对着平面图猜角度。每个动作都是真实动捕数据驱动的 3D 演示——自由旋转、逐帧拆解、
          错误对比、跟练计时，把「练对」这件事交给眼睛。
        </m.p>
        <m.div className="hero-cta" {...rise(0.54)}>
          <Link to={`/plan/${PLANS[3].id}`} className="cta-solid">
            开始跟练
          </Link>
          <a href="#library" className="cta-ghost" onClick={scrollToLibrary}>
            浏览动作库
          </a>
        </m.div>
        <m.div className="hero-stats-v2" {...rise(0.64)}>
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
        </m.div>
      </div>

      {/* 外层负责入场编排，内层负责鼠标视差 */}
      <m.div
        className="hero-stage-outer"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
      >
        <m.div style={{ x: stageX, y: stageY }}>
          <div className="hero-stage" ref={stageRef}>
            <m.div className="hero-halo" style={{ x: haloX, y: haloY }} />
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
                  <TurnRig mx={mx}>
                    <CharacterModel
                      url={HERO_EXERCISE.model.url}
                      playing
                      speed={0.62}
                      onClips={setClipNames}
                      muscle={HERO_EXERCISE.muscle}
                      accent="#b8f135"
                    />
                  </TurnRig>
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

            {[
              { cls: 'sc-1', text: '360° 自由视角', d: 0.85 },
              { cls: 'sc-2', text: '真实动作捕捉', d: 1.0 },
              { cls: 'sc-3', text: '关键帧教学', d: 1.15 },
            ].map((c) => (
              <m.span
                key={c.cls}
                className={`stage-chip-wrap ${c.cls}`}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: c.d }}
              >
                <span className="stage-chip">{c.text}</span>
              </m.span>
            ))}
            <span className="stage-caption">Back Squat · Motion Capture</span>
          </div>
        </m.div>
      </m.div>
    </section>
  )
}
