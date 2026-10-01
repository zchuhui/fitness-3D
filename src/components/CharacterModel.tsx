import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import { Box3, Group, Vector3 } from 'three'
import type { AnimationClip, Mesh, Object3D } from 'three'
import { MUSCLE_REGIONS, type LookMode } from '../lib/bodyRegions'
import { buildGeneratedClip, motionSamples, sampleClipWorld } from '../motion/buildClip'
import type { MuscleGroup } from '../types'
import MotionTrails from './MotionTrails'
import { publicUrl } from '../lib/publicUrl'
import { applyLook, dressMannequin } from './studioLook'
import type { RegionKit } from './studioLook'

export interface CharacterModelProps {
  /** 模型文件 URL，支持 .glb / .fbx（Mixamo 直接下载的 FBX Binary 即可用） */
  url: string
  /** 要播放的动画剪辑名；找不到时自动播放第一个 */
  clip?: string
  /** 是否播放中 */
  playing: boolean
  /** 播放速度倍率 */
  speed: number
  /** 模型加载完成后回调可用的动画剪辑名列表 */
  onClips?: (names: string[]) => void
  /** 设置后播放程序生成的标准动作，不再使用模型文件自带的剪辑 */
  motionId?: string
  /**
   * 把动画定位到这个时刻（秒）。数值不变时不会每帧拉回，
   * 所以可以先钉在招牌姿势上，再把 playing 打开从这里继续播。
   */
  time?: number
  /** 切入剪辑的淡入秒数。封面要立刻定格，传 0 */
  blend?: number
  /** 每帧把当前动画时间（秒）写入该 ref，供外部进度条读取，不触发 React 重渲染 */
  timeRef?: MutableRefObject<number>
  /** 当前剪辑加载 / 切换后汇报时长（秒） */
  onDuration?: (duration: number) => void
  /** 目标肌群，教练 / 力学模式下对应分区会呼吸高亮 */
  muscle?: MuscleGroup
  /** 外观：教练人偶、解剖透视、力学轨迹 */
  look?: LookMode
  /** 高亮与轨迹颜色，缺省用肌群绿 */
  accent?: string
  /** 剪辑时长（秒），力学轨迹用它把 timeRef 归一化 */
  duration?: number
  /** 关键帧归一化时刻，轨迹上打点 */
  keyframes?: number[]
}

/**
 * 3D 角色模型：自动识别 GLB / FBX 格式，
 * 自动归一化尺寸（Mixamo 导出的模型比例不一，统一缩放到真人身高并双脚落地）。
 */
export default function CharacterModel(props: CharacterModelProps) {
  const url = publicUrl(props.url)
  const isFbx = url.toLowerCase().endsWith('.fbx')
  const next = { ...props, url }
  return isFbx ? <FbxRig {...next} /> : <GlbRig {...next} />
}

function GlbRig({ url, motionId, ...rest }: CharacterModelProps) {
  const { scene, animations } = useGLTF(url)
  // useGLTF 全局只缓存一份场景。对比模式两个画布如果直接挂它，
  // 后挂的会把模型从先挂的父节点里抢走，另一边就空了。
  const object = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const clips = useMemo(
    () => (motionId ? [buildGeneratedClip(object, motionId)] : animations),
    [object, animations, motionId],
  )
  return <Rig object={object} clips={clips} motionId={motionId} {...rest} />
}

function FbxRig({ url, ...rest }: CharacterModelProps) {
  const fbx = useFBX(url)
  const object = useMemo(() => SkeletonUtils.clone(fbx), [fbx])
  return <Rig object={object} clips={fbx.animations} {...rest} />
}

interface RigProps extends Omit<CharacterModelProps, 'url'> {
  object: Object3D
  clips: AnimationClip[]
}

/** 目标身高（米），所有模型统一缩放到这个高度 */
const TARGET_HEIGHT = 1.75

function Rig({
  object,
  clips,
  clip,
  playing,
  speed,
  onClips,
  time,
  blend = 0.25,
  timeRef,
  onDuration,
  motionId,
  muscle,
  look,
  accent,
  duration,
  keyframes,
}: RigProps) {
  const group = useRef<Group>(null!)
  /**
   * useAnimations 的 action 是惰性 getter：首次渲染时 group ref 还是 null，
   * 不读到动作，也不会自己再渲染一次。对比页没有 onClips，模型就会停在 T 姿。
   */
  const [animReady, setAnimReady] = useState(false)
  useEffect(() => {
    setAnimReady(true)
  }, [])
  const { actions, names } = useAnimations(clips, group)

  // 尺寸归一化：按包围盒缩放 + 居中 + 双脚落地
  const { scale, position } = useMemo(() => {
    // 胶囊骨在身体内部，但头球会把包围盒顶高，归一化时先摘掉
    const skipped: { mesh: Object3D; parent: Object3D }[] = []
    object.traverse((o) => {
      const mesh = o as Mesh
      if (mesh.isMesh && mesh.name.startsWith('capsule_') && mesh.parent) {
        skipped.push({ mesh, parent: mesh.parent })
      }
    })
    for (const item of skipped) item.parent.remove(item.mesh)
    const box = new Box3().setFromObject(object)
    for (const item of skipped) item.parent.add(item.mesh)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1
    return {
      scale: s,
      position: new Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    }
  }, [object])

  // 换成身体/关节两套材质，并开启阴影。关闭视锥剔除，避免旋转时模型整块消失
  useMemo(() => {
    dressMannequin(object)
  }, [object])

  // 向父组件汇报动画剪辑列表
  useEffect(() => {
    onClips?.(names)
  }, [names, onClips])

  // 指定的剪辑不存在时回退到第一个
  const activeClip = clip && names.includes(clip) ? clip : names[0]
  const action = animReady && activeClip ? (actions[activeClip] ?? null) : null
  const lookMode = look ?? 'coach'

  const samples = useMemo(() => {
    if (lookMode !== 'mechanics') return null
    if (motionId) {
      const baked = motionSamples(object, motionId)
      if (baked && baked.length > 1) return baked
    }
    const clipObj = clips.find((item) => item.name === activeClip) ?? clips[0]
    if (!clipObj) return null
    return sampleClipWorld(object, clipObj)
  }, [lookMode, object, motionId, clips, activeClip])

  useEffect(() => {
    applyLook(object, lookMode)
  }, [object, lookMode])

  // 汇报剪辑时长，时间轴据此归一化
  useEffect(() => {
    if (action) onDuration?.(action.getClip().duration)
  }, [action, onDuration])

  // 切换剪辑。blend 为 0 时立刻满权重，避免从绑定姿势塌进动作（封面悬停会看成下坠）
  useEffect(() => {
    if (!action) return
    action.reset()
    if (blend > 0) action.fadeIn(blend)
    else action.setEffectiveWeight(1)
    action.play()
    return () => {
      action.fadeOut(0.2)
    }
  }, [action, blend])

  // 播放 / 暂停 / 倍速
  useEffect(() => {
    if (!action) return
    action.paused = !playing
    action.setEffectiveTimeScale(speed)
  }, [action, playing, speed])

  // 逐帧 seek：paused 只是让有效时标为 0，采样仍按 action.time 进行，
  // 因此暂停态下直接改 time 即可把姿势钉到任意时刻
  useEffect(() => {
    if (!action || time == null) return
    const d = action.getClip().duration
    action.time = Math.max(0, Math.min(time, d))
    if (timeRef) timeRef.current = action.time
  }, [action, time, timeRef])

  // 每帧把当前动画时间同步给外部 ref（供进度条读取，避免 setState 引发重渲染）
  useFrame(({ clock }) => {
    if (action && timeRef) timeRef.current = action.time
    const kit = object.userData.fmKit as RegionKit | undefined
    if (!kit || !muscle) return
    const regions = MUSCLE_REGIONS[muscle]
    const pulse =
      lookMode === 'anatomy' ? 0 : 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.4))
    const color = accent ?? '#b8f135'
    for (const [region, mat] of kit.regions) {
      const on = lookMode !== 'anatomy' && regions.includes(region)
      mat.emissive.set(on ? color : '#000000')
      mat.emissiveIntensity = on ? pulse : 0
    }
  })

  return (
    <group ref={group} scale={scale} position={position}>
      <primitive object={object} />
      {lookMode === 'mechanics' && samples && samples.length > 1 && (
        <MotionTrails
          object={object}
          samples={samples}
          timeRef={timeRef}
          duration={duration || samples[samples.length - 1].t || 1}
          accent={accent ?? '#b8f135'}
          keyframes={keyframes}
        />
      )}
    </group>
  )
}
