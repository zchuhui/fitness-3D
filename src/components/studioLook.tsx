import { useEffect, useMemo } from 'react'
import {
  Bone,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshPhysicalMaterial,
  SkinnedMesh,
  SphereGeometry,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from 'three'
import type { Object3D } from 'three'
import {
  regionForBone,
  regionFromMeshName,
  type BodyRegion,
  type LookMode,
} from '../lib/bodyRegions'

const DRESSED = 'fm-dressed'

/** 分区底色仍是陶土，只拉开一点冷暖，高亮交给 emissive */
const REGION_COLOR: Record<BodyRegion, string> = {
  chest: '#f6cbb8',
  back: '#e4b09e',
  shoulders: '#f3c4ae',
  arms: '#efbfa9',
  core: '#f8d0bc',
  legs: '#eab5a2',
  head: '#f7d2c0',
}

export interface RegionKit {
  regions: Map<BodyRegion, MeshPhysicalMaterial>
  joints: MeshPhysicalMaterial
  capsule: MeshPhysicalMaterial
}

function makeBody(color: string) {
  return new MeshPhysicalMaterial({
    color,
    roughness: 0.46,
    metalness: 0,
    sheen: 0.7,
    sheenRoughness: 0.42,
    sheenColor: new Color('#ffe0d2'),
    clearcoat: 0.14,
    clearcoatRoughness: 0.5,
    emissive: new Color('#000000'),
    emissiveIntensity: 0,
  })
}

function createKit(): RegionKit {
  const regions = new Map<BodyRegion, MeshPhysicalMaterial>()
  for (const [region, color] of Object.entries(REGION_COLOR) as [BodyRegion, string][]) {
    regions.set(region, makeBody(color))
  }
  return {
    regions,
    joints: new MeshPhysicalMaterial({
      color: '#6b4338',
      roughness: 0.58,
      metalness: 0.06,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
      emissive: new Color('#000000'),
      emissiveIntensity: 0,
    }),
    capsule: new MeshPhysicalMaterial({
      color: '#d5e4f6',
      roughness: 0.32,
      metalness: 0.08,
      transparent: true,
      opacity: 0.88,
      emissive: new Color('#9eb6ff'),
      emissiveIntensity: 0.35,
    }),
  }
}

function assignMesh(
  mesh: Mesh,
  material: MeshPhysicalMaterial,
  role: 'body' | 'joint' | 'capsule',
  region?: BodyRegion,
) {
  mesh.material = material
  mesh.castShadow = role === 'body'
  mesh.receiveShadow = role === 'body'
  mesh.frustumCulled = false
  mesh.userData.fmRole = role
  if (region) mesh.userData.fmRegion = region
  if (role === 'capsule') mesh.visible = false
}

function majority(a: BodyRegion, b: BodyRegion, c: BodyRegion): BodyRegion {
  if (a === b || a === c) return a
  if (b === c) return b
  return a
}

/** 按主导骨骼把一张蒙皮拆成肌群网格，皮肤索引原样保留 */
function splitSkinned(mesh: SkinnedMesh, kit: RegionKit) {
  const geo = mesh.geometry
  const pos = geo.attributes.position
  const skinIndex = geo.attributes.skinIndex
  const skinWeight = geo.attributes.skinWeight
  if (!pos || !skinIndex || !skinWeight) return

  const bones = mesh.skeleton.bones
  const vertRegion: BodyRegion[] = new Array(pos.count)
  const v = new Vector3()
  const local = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    let bi = 0
    let bw = -1
    for (let k = 0; k < skinIndex.itemSize; k++) {
      const wt = skinWeight.getComponent(i, k)
      if (wt > bw) {
        bw = wt
        bi = skinIndex.getComponent(i, k)
      }
    }
    const inv = mesh.skeleton.boneInverses[bi]
    if (inv) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.bindMatrix)
      local.copy(v).applyMatrix4(inv)
    } else {
      local.set(0, 0, -1)
    }
    vertRegion[i] = regionForBone(bones[bi]?.name ?? '', local.z)
  }

  const index = geo.index
  const triCount = index ? index.count / 3 : pos.count / 3
  const buckets = new Map<BodyRegion, number[]>()
  const read = (t: number) => (index ? index.getX(t) : t)
  for (let t = 0; t < triCount; t++) {
    const a = read(t * 3)
    const b = read(t * 3 + 1)
    const c = read(t * 3 + 2)
    const region = majority(vertRegion[a], vertRegion[b], vertRegion[c])
    let arr = buckets.get(region)
    if (!arr) buckets.set(region, (arr = []))
    arr.push(a, b, c)
  }

  const parent = mesh.parent
  if (!parent) return
  const nrm = geo.attributes.normal
  const uv = geo.attributes.uv
  const bindMatrix = mesh.bindMatrix.clone()

  for (const [region, corners] of buckets) {
    const remap = new Map<number, number>()
    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const skinI: number[] = []
    const skinW: number[] = []
    const indices: number[] = []
    for (const old of corners) {
      let ni = remap.get(old)
      if (ni === undefined) {
        ni = remap.size
        remap.set(old, ni)
        positions.push(pos.getX(old), pos.getY(old), pos.getZ(old))
        if (nrm) normals.push(nrm.getX(old), nrm.getY(old), nrm.getZ(old))
        if (uv) uvs.push(uv.getX(old), uv.getY(old))
        for (let k = 0; k < 4; k++) {
          skinI.push(skinIndex.getComponent(old, k))
          skinW.push(skinWeight.getComponent(old, k))
        }
      }
      indices.push(ni)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(positions, 3))
    if (normals.length) g.setAttribute('normal', new Float32BufferAttribute(normals, 3))
    if (uvs.length) g.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
    g.setAttribute('skinIndex', new Uint16BufferAttribute(skinI, 4))
    g.setAttribute('skinWeight', new Float32BufferAttribute(skinW, 4))
    g.setIndex(indices)
    const part = new SkinnedMesh(g)
    part.name = `region_${region}`
    part.bind(mesh.skeleton, bindMatrix)
    assignMesh(part, kit.regions.get(region)!, 'body', region)
    parent.add(part)
  }

  parent.remove(mesh)
  geo.dispose()
}

const CAPSULE_LINKS: [string, string][] = [
  ['Hips', 'Spine'],
  ['Spine', 'Spine1'],
  ['Spine1', 'Spine2'],
  ['Spine2', 'Neck'],
  ['Neck', 'Head'],
  ['LeftShoulder', 'LeftArm'],
  ['LeftArm', 'LeftForeArm'],
  ['LeftForeArm', 'LeftHand'],
  ['RightShoulder', 'RightArm'],
  ['RightArm', 'RightForeArm'],
  ['RightForeArm', 'RightHand'],
  ['LeftUpLeg', 'LeftLeg'],
  ['LeftLeg', 'LeftFoot'],
  ['LeftFoot', 'LeftToeBase'],
  ['RightUpLeg', 'RightLeg'],
  ['RightLeg', 'RightFoot'],
  ['RightFoot', 'RightToeBase'],
]

function boneMap(root: Object3D) {
  const bones = new Map<string, Bone>()
  root.traverse((o) => {
    const bone = o as Bone
    if (!bone.isBone) return
    bones.set(bone.name.replace(/^mixamorig:?/, ''), bone)
  })
  return bones
}

/** 没有内置胶囊时，按骨骼长度在运行时补一套，半径跟骨长走，厘米/米骨架都能用 */
function ensureCapsules(root: Object3D, kit: RegionKit) {
  let found = false
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    if (mesh.name.startsWith('capsule_') || mesh.userData.fmRole === 'capsule') {
      found = true
      assignMesh(mesh, kit.capsule, 'capsule')
    }
  })
  if (found) return

  const bones = boneMap(root)
  const up = new Vector3(0, 1, 0)
  const dir = new Vector3()
  for (const [parentName, childName] of CAPSULE_LINKS) {
    const parent = bones.get(parentName)
    const child = bones.get(childName)
    if (!parent || !child) continue
    const len = child.position.length()
    if (len < 1e-4) continue
    const radius = len * 0.13
    const mesh = new Mesh(new CylinderGeometry(radius, radius * 0.9, len, 6, 1, true), kit.capsule)
    mesh.position.copy(child.position).multiplyScalar(0.5)
    dir.copy(child.position).normalize()
    mesh.quaternion.setFromUnitVectors(up, dir)
    mesh.name = `capsule_${childName}`
    assignMesh(mesh, kit.capsule, 'capsule')
    parent.add(mesh)
  }

  const head = bones.get('Head')
  const top = bones.get('HeadTop_End')
  if (head) {
    const len = top ? top.position.length() : head.position.length()
    const radius = Math.max(len * 0.85, 0.06)
    const bulb = new Mesh(new SphereGeometry(radius, 10, 8), kit.capsule)
    bulb.name = 'capsule_HeadBulb'
    if (top) bulb.position.copy(top.position).multiplyScalar(0.45)
    assignMesh(bulb, kit.capsule, 'capsule')
    head.add(bulb)
  }
}

/**
 * 分区材质：优先用网格名（自建角色的 region_* 槽），否则按蒙皮权重拆。
 * 场景被 useGLTF / useFBX 缓存，只处理一次。
 */
export function dressMannequin(root: Object3D): RegionKit {
  const cached = root.userData.fmKit as RegionKit | undefined
  if (root.userData[DRESSED] && cached) return cached

  const kit = createKit()
  root.userData.fmKit = kit
  root.userData[DRESSED] = true

  const meshes: Mesh[] = []
  root.traverse((o) => {
    const mesh = o as Mesh
    if (mesh.isMesh) meshes.push(mesh)
  })

  for (const mesh of meshes) {
    if (mesh.name.startsWith('capsule_') || mesh.userData.fmRole === 'capsule') {
      assignMesh(mesh, kit.capsule, 'capsule')
      continue
    }
    if (/joint/i.test(mesh.name)) {
      assignMesh(mesh, kit.joints, 'joint')
      continue
    }
    const named = regionFromMeshName(mesh.name)
    if (named) {
      assignMesh(mesh, kit.regions.get(named)!, 'body', named)
      continue
    }
    const skinned = mesh as SkinnedMesh
    if (skinned.isSkinnedMesh && skinned.geometry.attributes.skinIndex) {
      splitSkinned(skinned, kit)
      continue
    }
    assignMesh(mesh, kit.regions.get('core')!, 'body', 'core')
  }

  ensureCapsules(root, kit)
  return kit
}

/** 透视：身体变半透明并露出胶囊骨；教练 / 力学保持不透明人偶 */
export function applyLook(root: Object3D, mode: LookMode) {
  const anatomy = mode === 'anatomy'
  root.traverse((o) => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    const role = mesh.userData.fmRole as string | undefined
    if (role === 'capsule') {
      mesh.visible = anatomy
      return
    }
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of list) {
      const m = mat as MeshPhysicalMaterial
      if (!m || m.opacity === undefined) continue
      if (role === 'body') {
        m.transparent = anatomy
        m.opacity = anatomy ? 0.22 : 1
        m.depthWrite = !anatomy
        m.needsUpdate = true
      } else if (role === 'joint') {
        m.transparent = anatomy
        m.opacity = anatomy ? 0.16 : 1
        m.depthWrite = !anatomy
        m.needsUpdate = true
      }
    }
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
