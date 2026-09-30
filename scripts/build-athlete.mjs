/**
 * 把 X Bot 重构成统一运动员骨架：
 * - 蒙皮按肌群拆成 region_* 网格（胸/背/肩/臂/核心/腿/头）
 * - 骨骼上挂胶囊骨架 capsule_*
 * - Draco 压缩后写到 public/models/athlete.glb，并替换 Xbot.glb
 * 原始文件备份为 public/models/Xbot.source.glb（只在第一次备份）。
 *
 * 分区规则与 src/lib/bodyRegions.ts 保持一致：脊柱局部 -Z 为正面。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const models = join(root, 'public', 'models')
const sourcePath = join(models, 'Xbot.source.glb')
const xbotPath = join(models, 'Xbot.glb')
const athletePath = join(models, 'athlete.glb')

globalThis.ProgressEvent = class ProgressEvent extends Event {
  constructor(type, init = {}) {
    super(type)
    Object.assign(this, init)
  }
}
globalThis.FileReader = class FileReader extends EventTarget {
  constructor() {
    super()
    this.result = null
    this.onloadend = null
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf
      this.onloadend?.()
    })
  }
}
globalThis.fetch = async (input) => {
  const href = typeof input === 'string' ? input : input.url
  const buf = readFileSync(fileURLToPath(href))
  return new Response(buf)
}

const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js')
const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')
const {
  Bone,
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Mesh,
  SkinnedMesh,
  SphereGeometry,
  Uint16BufferAttribute,
  Vector3,
} = await import('three')

function regionForBone(boneName, localZ) {
  const n = boneName.replace(/^mixamorig:?/, '')
  if (/Shoulder/.test(n) || /Neck/.test(n)) return 'shoulders'
  if (/Hand|Thumb|Index|Middle|Ring|Pinky|ForeArm/.test(n) || /Arm$/.test(n)) return 'arms'
  if (/UpLeg|Leg$|Foot|Toe/.test(n)) return 'legs'
  if (/Head|Eye/.test(n)) return 'head'
  const front = localZ < 0
  if (/Spine2/.test(n)) return front ? 'chest' : 'back'
  if (/Spine1|^Spine$|Hips/.test(n)) return front ? 'core' : 'back'
  return 'core'
}

function majority(a, b, c) {
  if (a === b || a === c) return a
  if (b === c) return b
  return a
}

function splitSkinned(mesh) {
  const geo = mesh.geometry
  const pos = geo.attributes.position
  const skinIndex = geo.attributes.skinIndex
  const skinWeight = geo.attributes.skinWeight
  const bones = mesh.skeleton.bones
  const vertRegion = new Array(pos.count)
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
    } else local.set(0, 0, -1)
    vertRegion[i] = regionForBone(bones[bi]?.name ?? '', local.z)
  }

  const index = geo.index
  const triCount = index ? index.count / 3 : pos.count / 3
  const buckets = new Map()
  const read = (t) => (index ? index.getX(t) : t)
  for (let t = 0; t < triCount; t++) {
    const a = read(t * 3)
    const b = read(t * 3 + 1)
    const c = read(t * 3 + 2)
    const region = majority(vertRegion[a], vertRegion[b], vertRegion[c])
    if (!buckets.has(region)) buckets.set(region, [])
    buckets.get(region).push(a, b, c)
  }

  const parent = mesh.parent
  const nrm = geo.attributes.normal
  const uv = geo.attributes.uv
  const bindMatrix = mesh.bindMatrix.clone()
  let parts = 0
  for (const [region, corners] of buckets) {
    if (corners.length < 3) continue
    const remap = new Map()
    const positions = []
    const normals = []
    const uvs = []
    const skinI = []
    const skinW = []
    const indices = []
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
    part.frustumCulled = false
    parent.add(part)
    parts++
  }
  parent.remove(mesh)
  geo.dispose()
  return parts
}

const LINKS = [
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

function addCapsules(scene) {
  const bones = new Map()
  scene.traverse((o) => {
    if (o.isBone) bones.set(o.name.replace(/^mixamorig:?/, ''), o)
  })
  const up = new Vector3(0, 1, 0)
  const dir = new Vector3()
  let n = 0
  for (const [parentName, childName] of LINKS) {
    const parent = bones.get(parentName)
    const child = bones.get(childName)
    if (!parent || !child) continue
    const len = child.position.length()
    if (len < 1e-4) continue
    const radius = len * 0.13
    const mesh = new Mesh(new CylinderGeometry(radius, radius * 0.9, len, 6, 1, true))
    mesh.position.copy(child.position).multiplyScalar(0.5)
    dir.copy(child.position).normalize()
    mesh.quaternion.setFromUnitVectors(up, dir)
    mesh.name = `capsule_${childName}`
    parent.add(mesh)
    n++
  }
  const head = bones.get('Head')
  const top = bones.get('HeadTop_End')
  if (head) {
    const len = top ? top.position.length() : head.position.length()
    const bulb = new Mesh(new SphereGeometry(Math.max(len * 0.85, 0.06), 10, 8))
    bulb.name = 'capsule_HeadBulb'
    if (top) bulb.position.copy(top.position).multiplyScalar(0.45)
    head.add(bulb)
    n++
  }
  return n
}

function boneWorld(scene, short) {
  let bone = null
  scene.traverse((o) => {
    if (o.isBone && o.name.replace(/^mixamorig:?/, '') === short) bone = o
  })
  scene.updateMatrixWorld(true)
  const p = new Vector3()
  bone?.getWorldPosition(p)
  return p
}

async function loadGltf(url, dracoPath) {
  const loader = new GLTFLoader()
  if (dracoPath) {
    const draco = new DRACOLoader()
    draco.setDecoderPath(dracoPath)
    loader.setDRACOLoader(draco)
  }
  return loader.loadAsync(url)
}

if (!existsSync(sourcePath)) {
  if (!existsSync(xbotPath)) throw new Error('找不到 public/models/Xbot.glb')
  copyFileSync(xbotPath, sourcePath)
  console.log('backed up', sourcePath)
}

const sourceUrl = new URL('../public/models/Xbot.source.glb', import.meta.url).href
const gltf = await loadGltf(sourceUrl)
const before = boneWorld(gltf.scene, 'Hips')
console.log('source hips', before.toArray().map((n) => +n.toFixed(3)))

const surfaces = []
gltf.scene.traverse((o) => {
  if (o.isSkinnedMesh && !/joint/i.test(o.name)) surfaces.push(o)
})
let partCount = 0
for (const mesh of surfaces) partCount += splitSkinned(mesh)
const capsules = addCapsules(gltf.scene)
console.log('regions', partCount, 'capsules', capsules)

const raw = await new GLTFExporter().parseAsync(gltf.scene, { binary: true })
const rawBytes = raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(raw.buffer)

const { NodeIO } = await import('@gltf-transform/core')
const { KHRDracoMeshCompression } = await import('@gltf-transform/extensions')
const { draco } = await import('@gltf-transform/functions')
const draco3d = (await import('draco3dgltf')).default

const io = new NodeIO().registerExtensions([KHRDracoMeshCompression]).registerDependencies({
  'draco3d.encoder': await draco3d.createEncoderModule(),
  'draco3d.decoder': await draco3d.createDecoderModule(),
})
const document = await io.readBinary(rawBytes)
await document.transform(
  draco({
    method: 'edgebreaker',
    quantizePosition: 14,
    quantizeNormal: 10,
    quantizeGeneric: 16,
  }),
)
const compressed = await io.writeBinary(document)
console.log('raw', rawBytes.byteLength, 'draco', compressed.byteLength)

writeFileSync(athletePath, compressed)

let hipsLocal = null
gltf.scene.traverse((o) => {
  if (o.isBone && /(^|:)Hips$/.test(o.name.replace('mixamorig', ''))) hipsLocal = o.position.toArray()
})
const check = await io.readBinary(compressed)
const nodes = check.getRoot().listNodes()
const hipsNode = nodes.find((n) => /Hips$/.test(n.getName()) && !/UpLeg/.test(n.getName()))
const exported = hipsNode?.getTranslation() ?? [0, 0, 0]
const delta = hipsLocal
  ? Math.hypot(exported[0] - hipsLocal[0], exported[1] - hipsLocal[1], exported[2] - hipsLocal[2])
  : Infinity
const meshNames = check
  .getRoot()
  .listMeshes()
  .map((m) => m.getName())
const regionNodes = nodes.map((n) => n.getName()).filter((n) => n.startsWith('region_'))
const capsuleCount = nodes.filter((n) => n.getName().startsWith('capsule_')).length
console.log('hips local', hipsLocal, 'exported', exported, 'delta', delta.toFixed(4))
console.log('mesh names', meshNames.join(' | '))
console.log('region nodes', regionNodes.join(', '), 'capsules', capsuleCount)
if (regionNodes.length < 4 || capsuleCount < 8 || delta > 1) {
  throw new Error('导出的骨架与源模型对不上，已中止替换')
}
if (compressed.byteLength > 1024 * 1024) {
  console.warn('警告：压缩后仍大于 1MB', compressed.byteLength)
}

copyFileSync(athletePath, xbotPath)
const dracoDir = new URL('../node_modules/three/examples/jsm/libs/draco/gltf/', import.meta.url)
const publicDraco = join(root, 'public', 'draco')
mkdirSync(publicDraco, { recursive: true })
for (const file of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
  copyFileSync(fileURLToPath(new URL(file, dracoDir)), join(publicDraco, file))
}
console.log('replaced', xbotPath, 'decoder', publicDraco)
void Bone
