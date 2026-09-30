import { useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useAnimations, useFBX, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Box3, Group, Vector3 } from 'three'
import type { AnimationClip, Object3D } from 'three'
import { buildGeneratedClip } from '../motion/buildClip'
import { dressMannequin } from './studioLook'

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
  /** 把动画钉到这个时刻（秒）。仅暂停时生效；播放中传 undefined */
  time?: number
  /** 每帧把当前动画时间（秒）写入该 ref，供外部进度条读取，不触发 React 重渲染 */
  timeRef?: MutableRefObject<number>
  /** 当前剪辑加载 / 切换后汇报时长（秒） */
  onDuration?: (duration: number) => void
}

/**
 * 3D 角色模型：自动识别 GLB / FBX 格式，
 * 自动归一化尺寸（Mixamo 导出的模型比例不一，统一缩放到真人身高并双脚落地）。
 */
export default function CharacterModel(props: CharacterModelProps) {
  const isFbx = props.url.toLowerCase().endsWith('.fbx')
  return isFbx ? <FbxRig {...props} /> : <GlbRig {...props} />
}

function GlbRig({ url, motionId, ...rest }: CharacterModelProps) {
  const { scene, animations } = useGLTF(url)
  const clips = useMemo(
    () => (motionId ? [buildGeneratedClip(scene, motionId)] : animations),
    [scene, animations, motionId],
  )
  return <Rig object={scene} clips={clips} {...rest} />
}

function FbxRig({ url, ...rest }: CharacterModelProps) {
  const fbx = useFBX(url)
  return <Rig object={fbx} clips={fbx.animations} {...rest} />
}

interface RigProps extends Omit<CharacterModelProps, 'url'> {
  object: Object3D
  clips: AnimationClip[]
}

/** 目标身高（米），所有模型统一缩放到这个高度 */
const TARGET_HEIGHT = 1.75

function Rig({ object, clips, clip, playing, speed, onClips, time, timeRef, onDuration }: RigProps) {
  const group = useRef<Group>(null!)
  const { actions, names } = useAnimations(clips, group)

  // 尺寸归一化：按包围盒缩放 + 居中 + 双脚落地
  const { scale, position } = useMemo(() => {
    const box = new Box3().setFromObject(object)
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
  const action = activeClip ? actions[activeClip] : null

  // 汇报剪辑时长，时间轴据此归一化
  useEffect(() => {
    if (action) onDuration?.(action.getClip().duration)
  }, [action, onDuration])

  // 切换剪辑：淡入新动画
  useEffect(() => {
    if (!action) return
    action.reset().fadeIn(0.25).play()
    return () => {
      action.fadeOut(0.2)
    }
  }, [action])

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
  useFrame(() => {
    if (action && timeRef) timeRef.current = action.time
  })

  return (
    <group ref={group} scale={scale} position={position}>
      <primitive object={object} />
    </group>
  )
}
