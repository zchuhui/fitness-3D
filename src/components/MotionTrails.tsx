import { useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Bone, Color, Group, Vector2, Vector3 } from 'three'
import type { Object3D } from 'three'
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib'
import type { FrameSample } from '../motion/buildClip'
import { shortBone } from '../lib/bodyRegions'

const TRACKS: { key: keyof FrameSample; color: string; width: number }[] = [
  { key: 'handL', color: '#f4f7ff', width: 2.2 },
  { key: 'handR', color: '#f4f7ff', width: 2.2 },
  { key: 'footL', color: '#9eb6ff', width: 2 },
  { key: 'footR', color: '#9eb6ff', width: 2 },
  { key: 'hips', color: '#b8f135', width: 2.6 },
]

function toFlat(samples: FrameSample[], key: keyof FrameSample) {
  const flat: number[] = []
  for (const sample of samples) {
    const p = sample[key]
    if (!Array.isArray(p)) continue
    flat.push(p[0], p[1], p[2])
  }
  return flat
}

function TrailLine({
  samples,
  track,
  accent,
  timeRef,
  duration,
  bright,
}: {
  samples: FrameSample[]
  track: (typeof TRACKS)[number]
  accent: string
  timeRef?: MutableRefObject<number>
  duration: number
  bright?: boolean
}) {
  const size = useThree((s) => s.size)
  const full = useMemo(() => toFlat(samples, track.key), [samples, track.key])
  const line = useMemo(() => {
    const geom = new LineGeometry()
    geom.setPositions(full)
    const mat = new LineMaterial({
      color: new Color(bright ? accent : track.color).getHex(),
      linewidth: bright ? track.width + 0.8 : track.width,
      transparent: true,
      opacity: bright ? 0.95 : 0.28,
      depthTest: false,
    })
    const obj = new Line2(geom, mat)
    obj.frustumCulled = false
    obj.renderOrder = bright ? 3 : 2
    return obj
  }, [full, track.color, track.width, accent, bright])

  useEffect(() => {
    return () => {
      line.geometry.dispose()
      ;(line.material as LineMaterial).dispose()
    }
  }, [line])

  useFrame(() => {
    const mat = line.material as LineMaterial
    mat.resolution = new Vector2(size.width, size.height)
    if (!bright) return
    const d = duration || samples[samples.length - 1]?.t || 1
    const t = timeRef?.current ?? 0
    const p = Math.min(1, Math.max(0, t / d))
    const count = Math.max(2, Math.ceil(p * (samples.length - 1)) + 1)
    const geom = line.geometry as LineGeometry
    geom.setPositions(full.slice(0, count * 3))
  })

  return <primitive object={line} />
}

function findBone(root: Object3D, name: string): Bone | null {
  let found: Bone | null = null
  root.traverse((o) => {
    const bone = o as Bone
    if (bone.isBone && shortBone(bone.name) === name) found = bone
  })
  return found
}

function jointDegrees(parent: Bone, joint: Bone, child: Bone) {
  const p = new Vector3()
  const j = new Vector3()
  const c = new Vector3()
  parent.getWorldPosition(p)
  joint.getWorldPosition(j)
  child.getWorldPosition(c)
  p.sub(j).normalize()
  c.sub(j).normalize()
  const dot = Math.min(1, Math.max(-1, p.dot(c)))
  return Math.round((Math.acos(dot) * 180) / Math.PI)
}

function AngleTag({
  object,
  label,
  parent,
  joint,
  child,
}: {
  object: Object3D
  label: string
  parent: string
  joint: string
  child: string
}) {
  const group = useRef<Group>(null)
  const span = useRef<HTMLSpanElement>(null)
  const bones = useMemo((): { a: Bone; b: Bone; c: Bone } | null => {
    const a = findBone(object, parent)
    const b = findBone(object, joint)
    const c = findBone(object, child)
    return a && b && c ? { a, b, c } : null
  }, [object, parent, joint, child])
  const tmp = useMemo(() => new Vector3(), [])

  useFrame(() => {
    if (!bones || !group.current) return
    const deg = jointDegrees(bones.a, bones.b, bones.c)
    if (span.current) span.current.textContent = `${label} ${deg}°`
    bones.b.getWorldPosition(tmp)
    const host = group.current.parent
    if (host) {
      host.worldToLocal(tmp)
      group.current.position.copy(tmp)
    }
  })

  if (!bones) return null
  return (
    <group ref={group}>
      <Html center distanceFactor={7} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span ref={span} className="joint-angle">
          {label}
        </span>
      </Html>
    </group>
  )
}

/** 手足髋的整段轨迹：暗线是全程，亮线跟播放头走到当前帧；旁边标关节夹角 */
export default function MotionTrails({
  object,
  samples,
  timeRef,
  duration,
  accent,
  keyframes,
}: {
  object: Object3D
  samples: FrameSample[]
  timeRef?: MutableRefObject<number>
  duration: number
  accent: string
  keyframes?: number[]
}) {
  const markers = useMemo(() => {
    const hips = samples.map((s) => s.hips)
    return (keyframes ?? [])
      .map((at) => {
        const i = Math.round(Math.min(1, Math.max(0, at)) * (samples.length - 1))
        const p = hips[i]
        return p ? ([p[0], p[1], p[2]] as [number, number, number]) : null
      })
      .filter((p): p is [number, number, number] => !!p)
  }, [samples, keyframes])

  const tint = useMemo(() => new Color(accent), [accent])

  return (
    <group>
      {TRACKS.map((track) => (
        <TrailLine
          key={track.key}
          samples={samples}
          track={track}
          accent={track.key === 'hips' ? accent : track.color}
          timeRef={timeRef}
          duration={duration}
        />
      ))}
      {TRACKS.map((track) => (
        <TrailLine
          key={`${track.key}-hot`}
          samples={samples}
          track={track}
          accent={track.key === 'hips' ? accent : track.color}
          timeRef={timeRef}
          duration={duration}
          bright
        />
      ))}
      {markers.map((position, i) => (
        <mesh key={i} position={position} renderOrder={4}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshBasicMaterial color={tint} toneMapped={false} depthTest={false} />
        </mesh>
      ))}
      <AngleTag object={object} label="膝" parent="LeftUpLeg" joint="LeftLeg" child="LeftFoot" />
      <AngleTag object={object} label="肘" parent="LeftArm" joint="LeftForeArm" child="LeftHand" />
      <AngleTag object={object} label="髋" parent="Spine" joint="Hips" child="LeftUpLeg" />
    </group>
  )
}
