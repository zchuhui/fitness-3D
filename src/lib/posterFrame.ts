import { Box3, MathUtils, PerspectiveCamera, Vector3, type Mesh, type Object3D } from 'three'
import type { Exercise } from '../types'

/** 封面统一焦距。窄一点、机位远一点，人物比例不被透视拉变形 */
export const COVER_FOV = 26
/** 所有封面同一画幅 3:2；卡片里按高度铺满、水平居中，多出来的两侧被裁掉 */
export const COVER_W = 960
export const COVER_H = 640

/**
 * 版式全部按「画面高度」为单位（0 = 画面中心，±0.5 = 上下边），与卡片宽度无关，
 * 所以海报图和悬停实时画布在任何卡片宽度下都能逐像素重合。
 * 须与 index.css 里 .card-floor 的位置保持一致（基线在画面 84% 处）。
 */
export const COVER_BASELINE = 0.84
const BASE_Y = 0.5 - COVER_BASELINE
const TOP_Y = 0.5 - 0.08
const BOTTOM_Y = -0.5 + 0.04
/** 最窄的卡片约 1.24:1，人物左右各留一点边 */
const SIDE_X = 0.58
/** 站立的人约占画面 72% 高。所有动作同一机位距离，人物大小一致 */
const STAND_HEIGHT = 1.75
const STAND_FILL = 0.72

/** 包围盒低于这个高度视为贴地动作（俯撑、仰卧、跪姿），改用偏侧面的机位看清身体线条 */
const FLOOR_POSE_HEIGHT = 1.0
const VIEW_STAND = { azimuth: 32, elevation: 7 }
const VIEW_FLOOR = { azimuth: 60, elevation: 16 }

export interface CoverView {
  /** 绕竖轴，从角色正前方（+z）往角色左侧（+x）转的角度 */
  azimuth?: number
  /** 俯视角 */
  elevation?: number
}

const _box = new Box3()
const _v = new Vector3()
const _up = new Vector3()

/** 当前姿势下的蒙皮顶点（抽样），比包围盒角点准：斜视角下角点会比真实的脚更靠下 */
function skinnedPoints(root: Object3D, stride = 6): Vector3[] {
  const out: Vector3[] = []
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh || !mesh.visible) return
    const pos = mesh.geometry.getAttribute('position')
    if (!pos) return
    for (let i = 0; i < pos.count; i += stride) {
      mesh.getVertexPosition(i, _v)
      out.push(_v.clone().applyMatrix4(mesh.matrixWorld))
    }
  })
  return out
}

function aim(camera: PerspectiveCamera, anchor: Vector3, dir: Vector3, dist: number, tanHalf: number) {
  camera.position.copy(anchor).addScaledVector(dir, dist)
  camera.up.set(0, 1, 0)
  camera.lookAt(anchor)
  camera.updateMatrixWorld()
  // 镜头整体沿自身上方向平移，让地面锚点正好落在基线上（平移不改变透视，人物大小不变）
  const lift = -BASE_Y * 2 * dist * tanHalf
  _up.setFromMatrixColumn(camera.matrixWorld, 1).normalize()
  const look = anchor.clone().addScaledVector(_up, lift)
  camera.position.addScaledVector(_up, lift)
  camera.lookAt(look)
  camera.updateMatrixWorld()
  return look
}

/**
 * 把当前姿势的角色装进封面：
 * - 机位距离固定，人物大小在所有动作之间一致；只有放不下（举过头、长条贴地）时才整体拉远
 * - 身体正下方的地面点钉在基线上，脚和地面光斑对齐，不悬空
 * - 地面锚点水平居中
 * 返回镜头看向的点，供轨道控制器接着转。
 */
export function frameCover(
  camera: PerspectiveCamera,
  root: Object3D,
  aspect: number,
  view?: CoverView,
): [number, number, number] {
  root.updateWorldMatrix(true, true)
  const points = skinnedPoints(root)
  _box.makeEmpty()
  for (const p of points) _box.expandByPoint(p)
  if (_box.isEmpty()) return [0, 0.9, 0]

  const floorPose = _box.max.y < FLOOR_POSE_HEIGHT
  const base = floorPose ? VIEW_FLOOR : VIEW_STAND
  const az = MathUtils.degToRad(view?.azimuth ?? base.azimuth)
  const el = MathUtils.degToRad(view?.elevation ?? base.elevation)
  const dir = new Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
  const anchor = new Vector3((_box.min.x + _box.max.x) / 2, 0, (_box.min.z + _box.max.z) / 2)

  camera.fov = COVER_FOV
  camera.aspect = aspect > 0.2 ? aspect : COVER_W / COVER_H
  camera.near = 0.05
  camera.far = 120
  camera.updateProjectionMatrix()
  const tanHalf = Math.tan(MathUtils.degToRad(COVER_FOV) / 2)

  let dist = STAND_HEIGHT / (STAND_FILL * 2 * tanHalf)
  let look = anchor
  for (let k = 0; k < 8; k++) {
    look = aim(camera, anchor, dir, dist, tanHalf)
    let top = -Infinity
    let bottom = Infinity
    let side = 0
    for (const p of points) {
      _v.copy(p).project(camera)
      const x = (_v.x * camera.aspect) / 2
      const y = _v.y / 2
      if (y > top) top = y
      if (y < bottom) bottom = y
      if (Math.abs(x) > side) side = Math.abs(x)
    }
    // 相对锚点的尺寸与距离近似成反比，超出几成就拉远几成
    const over = Math.max(
      (top - BASE_Y) / (TOP_Y - BASE_Y),
      (BASE_Y - bottom) / (BASE_Y - BOTTOM_Y),
      side / SIDE_X,
    )
    if (over <= 1.002) break
    dist *= over * 1.01
  }
  return [look.x, look.y, look.z]
}

/** 招牌姿势：显式 posterAt > 关键帧中间一帧 > 0.4 */
export function posterAtOf(e: Exercise): number {
  if (e.posterAt != null) return e.posterAt
  const kfs = e.keyframes ?? []
  if (kfs.length > 0) return kfs[Math.min(Math.floor(kfs.length / 2), kfs.length - 1)].at
  return 0.4
}
