/**
 * public/ 下的静态资源地址。
 * 本地开发 BASE_URL 是 /，GitHub Pages 构建是 /fitness-3D/。
 */
export function publicUrl(path: string): string {
  if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path
  const base = import.meta.env.BASE_URL
  const clean = path.replace(/^\//, '')
  const prefix = base.replace(/^\//, '').replace(/\/$/, '')
  if (prefix && (clean === prefix || clean.startsWith(`${prefix}/`))) return `/${clean}`
  return `${base}${clean}`
}
