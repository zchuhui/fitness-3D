import { useEffect, useMemo } from 'react'
import { CanvasTexture, Color, Mesh, MeshPhysicalMaterial, SRGBColorSpace } from 'three'
import type { Object3D } from 'three'

const DRESSED = 'fm-dressed'

/** 身体：带绒面光泽的陶土色，避免一整块平涂 */
const bodyMaterial = new MeshPhysicalMaterial({
  color: '#f1c3ae',
  roughness: 0.46,
  metalness: 0,
  sheen: 0.7,
  sheenRoughness: 0.42,
  sheenColor: new Color('#ffe0d2'),
  clearcoat: 0.14,
  clearcoatRoughness: 0.5,
})

/** 关节球：更深的橡胶色，和肢体拉开层次 */
const jointMaterial = new MeshPhysicalMaterial({
  color: '#6b4338',
  roughness: 0.58,
  metalness: 0.06,
  clearcoat: 0.28,
  clearcoatRoughness: 0.32,
})

/** 把默认的单一肉色换成身体 / 关节两套材质。场景被 useGLTF 缓存，只换一次 */
export function dressMannequin(root: Object3D) {
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || mesh.userData[DRESSED]) return
    const joint = /joint/i.test(mesh.name)
    const prev = mesh.material
    mesh.material = joint ? jointMaterial : bodyMaterial
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.userData[DRESSED] = true
    const list = Array.isArray(prev) ? prev : [prev]
    for (const m of list) m?.dispose?.()
  })
}

/** 主光 + 暖补光 + 肌群色轮廓光。背面看时肩膀和头会有一圈亮边 */
export function StudioLights({
  accent = '#b8f135',
  shadowMap = 1024,
  shadows = true,
}: {
  accent?: string
  shadowMap?: number
  shadows?: boolean
}) {
  return (
    <>
      <hemisphereLight args={['#fff1e8', '#141a28', 0.4]} />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[3.4, 6.2, 3.6]}
        intensity={1.9}
        castShadow={shadows}
        shadow-mapSize-width={shadowMap}
        shadow-mapSize-height={shadowMap}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
        shadow-camera-far={20}
      />
      <directionalLight position={[-4.5, 3.2, 2.2]} intensity={0.55} color="#ffc8b0" />
      <directionalLight position={[-2.2, 3.4, -5]} intensity={1.15} color={accent} />
      <directionalLight position={[3.2, 2.2, -4.2]} intensity={0.42} color="#9eb6ff" />
    </>
  )
}

function poolTexture(color: string) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')!
  const rgb = new Color(color)
  const r = Math.round(rgb.r * 255)
  const gv = Math.round(rgb.g * 255)
  const b = Math.round(rgb.b * 255)
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 122)
  grd.addColorStop(0, `rgba(${r},${gv},${b},0.34)`)
  grd.addColorStop(0.5, `rgba(${r},${gv},${b},0.1)`)
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  return tex
}

/** 脚下的肌群色光斑，让人物落在舞台上而不是飘在黑底里 */
export function StagePool({ color = '#b8f135' }: { color?: string }) {
  const map = useMemo(() => poolTexture(color), [color])
  useEffect(() => () => map.dispose(), [map])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[2.15, 48]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
