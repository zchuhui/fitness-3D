import { useRef, type MouseEvent, type RefObject } from 'react'

export interface Tilt<T extends HTMLElement> {
  /** 挂到目标元素上（卡片根节点） */
  tiltRef: RefObject<T>
  /** onMouseMove 处理器（未启用时为 undefined） */
  onTiltMove?: (e: MouseEvent) => void
  /** 离开时复位；调用方若已有 onMouseLeave，需自行串行调用 */
  onTiltLeave?: () => void
}

/**
 * 卡片 3D 倾斜 + 光标追光坐标：
 * - 鼠标移动时给元素写 inline transform（perspective + rotateX/Y），
 *   借助元素自身 CSS transition 获得弹簧平滑感；离开清空，回落到 CSS hover 态
 * - 同时写入 --mx/--my（百分比，供追光渐变）与 --mxn（0-1，供聚光锥摆动）
 * 仅精细指针 + 非减少动效时启用，其余情况返回空处理器。
 */
export function useTilt<T extends HTMLElement = HTMLElement>(max = 5): Tilt<T> {
  const tiltRef = useRef<T>(null)
  const enabled = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current

  if (!enabled) return { tiltRef }

  const onTiltMove = (e: MouseEvent) => {
    const el = tiltRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
    el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
    el.style.setProperty('--mxn', px.toFixed(3))
    const rx = (0.5 - py) * max
    const ry = (px - 0.5) * max
    // translateY(-5px) 与 .card-v2:hover 的抬起保持一致，避免 tilt 覆盖悬停位移
    el.style.transform = `perspective(900px) translateY(-5px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
  }

  const onTiltLeave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.transform = ''
  }

  return { tiltRef, onTiltMove, onTiltLeave }
}
