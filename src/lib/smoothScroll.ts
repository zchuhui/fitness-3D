import Lenis from 'lenis'

/**
 * lenis 平滑滚动单例（在 main.tsx 启动一次）。
 * prefers-reduced-motion 用户保持原生滚动，返回 null。
 * App 的 ScrollToTop / Hero 锚点跳转优先走 lenis.scrollTo 保持手感一致。
 */
export let lenis: Lenis | null = null

export function initSmoothScroll(): Lenis | null {
  if (lenis) return lenis
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  lenis = new Lenis({ lerp: 0.11 })
  const raf = (time: number) => {
    lenis!.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  return lenis
}
