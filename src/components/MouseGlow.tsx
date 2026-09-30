import { useEffect, type RefObject } from 'react'
import { m, useMotionValue, useSpring } from 'framer-motion'

/**
 * 光标跟随辉光：一块柔和的径向光斑，弹簧跟随鼠标，照亮所在容器。
 * 容器需 position: relative + overflow: clip（光斑绝对定位于其中）。
 * 仅精细指针 + 非减少动效时挂载监听，其余情况静默隐藏。
 */
export default function MouseGlow({
  containerRef,
  size = 600,
  color = 'rgba(184, 241, 53, 0.07)',
}: {
  /** 监听鼠标与定位的容器（光斑坐标相对它计算） */
  containerRef: RefObject<HTMLElement | null>
  /** 光斑直径 px */
  size?: number
  /** 中心色（向外渐隐到透明） */
  color?: string
}) {
  const x = useMotionValue(-size)
  const y = useMotionValue(-size)
  const sx = useSpring(x, { stiffness: 110, damping: 24, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 110, damping: 24, mass: 0.6 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      x.set(e.clientX - r.left - size / 2)
      y.set(e.clientY - r.top - size / 2)
    }
    el.addEventListener('mousemove', move)
    return () => el.removeEventListener('mousemove', move)
  }, [containerRef, size, x, y])

  return (
    <m.div
      aria-hidden="true"
      className="mouse-glow"
      style={{
        width: size,
        height: size,
        x: sx,
        y: sy,
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      }}
    />
  )
}
