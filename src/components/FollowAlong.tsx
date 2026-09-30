import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Grid, Html, OrbitControls } from '@react-three/drei'
import CharacterModel from './CharacterModel'
import type { Exercise } from '../types'
import { cueBeep, doneBeep, readyBeep, repBeep, tickBeep } from '../lib/beep'
import { isSfxEnabled, setSfxEnabled } from '../lib/beep'
import { canCheer, isVoiceEnabled, setVoiceEnabled, speak } from '../lib/coach'
import { pickCheer } from '../lib/cheer'

/** 跟练舞台相机（低机位给卧姿动作） */
const POS: [number, number, number] = [2.8, 1.5, 3.0]
const TARGET: [number, number, number] = [0, 0.95, 0]
const FLOOR_POS: [number, number, number] = [2.6, 1.4, 3.0]
const FLOOR_TARGET: [number, number, number] = [0, 0.35, 0]

const SPEEDS = [0.5, 0.75, 1]

type Phase = 'idle' | 'set' | 'rest' | 'done'

const fmt = (s: number) => {
  const v = Math.max(0, Math.ceil(s))
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`
}

/** 简化 3D 舞台：只保留旋转 + 循环示范 */
function Stage({
  exercise,
  playing,
  speed,
  timeRef,
  onDuration,
}: {
  exercise: Exercise
  playing: boolean
  speed: number
  timeRef: { current: number }
  onDuration?: (d: number) => void
}) {
  const floor = exercise.camera === 'floor'
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: floor ? FLOOR_POS : POS, fov: 42 }}>
      <color attach="background" args={['#0d1017']} />
      <fog attach="fog" args={['#0d1017', 9, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
        shadow-camera-far={20}
      />
      <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#9db8ff" />
      <Suspense
        fallback={
          <Html center>
            <div className="viewer-loading">
              <span className="spinner" />
              加载 3D 模型…
            </div>
          </Html>
        }
      >
        <CharacterModel
          url={exercise.model.url}
          clip={exercise.model.clip}
          motionId={exercise.generated ? exercise.model.clip : undefined}
          playing={playing}
          speed={speed}
          timeRef={timeRef}
          onDuration={onDuration}
        />
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={9} blur={2.2} far={4.5} resolution={512} color="#000000" />
      <Grid
        position={[0, 0.01, 0]}
        args={[12, 12]}
        cellSize={0.5}
        cellColor="#1d2436"
        sectionSize={2.5}
        sectionColor="#2e3c5c"
        fadeDistance={14}
        fadeStrength={2.5}
        infiniteGrid
      />
      <OrbitControls
        makeDefault
        target={floor ? FLOOR_TARGET : TARGET}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2 + 0.08}
      />
    </Canvas>
  )
}

/**
 * 跟练面板：3D 模型当节拍器。
 * 状态机 待开始 → 第 N 组 → 组间休息 → 完成；
 * 计次类动作通过检测模型播放回绕自动计数，计时类动作倒计时。
 * 完成后通过 onFinish 上报（由父级决定写日志 / 计划推进）。
 */
export default function FollowAlongPanel({
  exercise,
  onFinish,
}: {
  exercise: Exercise
  /** 训练完成（含手动结束）时上报实际完成的组数 */
  onFinish?: (setsDone: number) => void
}) {
  const program = exercise.program
  const isTimed = !!program?.seconds
  const [phase, setPhase] = useState<Phase>('idle')
  /** 当前组（0-based） */
  const [setIndex, setSetIndex] = useState(0)
  const [reps, setReps] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(0.75)
  const timeRef = useRef(0)
  const prevTime = useRef(0)
  /** 本组鼓励触发标记（过半/冲刺/休息中段），每组重置，保证只触发一次 */
  const cheeredRef = useRef({ half: false, last: false, rest: false })
  /** 当前剪辑时长（Stage 上报），发力点提示音据此换算 */
  const [duration, setDuration] = useState(0)
  /** 发力点（归一化时刻）：取 keyframes 里 0.2–0.6 之间的第一个（如深蹲底部） */
  const cueNorm = useMemo(() => {
    const kfs = (exercise.keyframes ?? []).filter((k) => k.at >= 0.2 && k.at <= 0.6)
    return kfs[0]?.at ?? 0.4
  }, [exercise.keyframes])
  /** 声音设置（音效 / 语音），localStorage 持久化 */
  const [sfxOn, setSfxOn] = useState(isSfxEnabled)
  const [voiceOn, setVoiceOn] = useState(isVoiceEnabled)

  /** 每组的次数/时长播报片段 */
  const briefText = isTimed ? `${program?.seconds ?? 0}秒` : `${program?.reps ?? 0}次`

  // 完成状态上报（只报一次）
  const reportedRef = useRef(false)
  const reportDone = useCallback(
    (setsDone: number) => {
      if (reportedRef.current) return
      reportedRef.current = true
      onFinish?.(setsDone)
    },
    [onFinish],
  )

  /** 本组完成：进入休息或整体完成 */
  const finishSet = useCallback(() => {
    doneBeep()
    if (setIndex + 1 >= (program?.sets ?? 1)) {
      setPhase('done')
      reportDone(program?.sets ?? setIndex + 1)
      speak(`训练完成，共${program?.sets ?? setIndex + 1}组。${pickCheer('allDone')}`)
    } else {
      setPhase('rest')
      setSecondsLeft(program?.restSeconds ?? 60)
      speak(`第${setIndex + 1}组完成，休息${program?.restSeconds ?? 60}秒。${pickCheer('setDone')}`)
    }
  }, [setIndex, program, reportDone])

  const startNextSet = useCallback(() => {
    readyBeep()
    const next = setIndex + 1
    const finalSet = next + 1 >= (program?.sets ?? 1)
    setSetIndex(next)
    setReps(0)
    setSecondsLeft(program?.seconds ?? 0)
    setPhase('set')
    cheeredRef.current = { half: false, last: false, rest: false }
    speak(`${finalSet ? '最后一组！' : ''}第${next + 1}组，${briefText}，开始`)
  }, [setIndex, program, briefText])

  const start = useCallback(() => {
    reportedRef.current = false
    setSetIndex(0)
    setReps(0)
    setSecondsLeft(program?.seconds ?? 0)
    setPaused(false)
    setPhase('set')
    cheeredRef.current = { half: false, last: false, rest: false }
    readyBeep()
    speak(`第1组，${briefText}，开始。${pickCheer('start')}`)
  }, [program, briefText])

  /** 手动结束：按已完成组数上报 */
  const quit = useCallback(() => {
    const setsDone = phase === 'rest' ? setIndex + 1 : phase === 'set' ? setIndex + 1 : setIndex
    // 当前组算完成（用户主动确认本组次数够了/结束训练）
    setPhase('done')
    reportDone(setsDone)
    doneBeep()
    speak(`训练结束，共完成${setsDone}组。${pickCheer('allDone')}`)
  }, [phase, setIndex, reportDone])

  // 计次类：检测模型循环回绕（time 从大跳回小）→ 完成 1 次；
  // 同时检测穿越发力点（如深蹲底部）→ 低音提示"该发力了"
  useEffect(() => {
    if (phase !== 'set' || paused || isTimed || !program?.reps) return
    const cueSec = duration > 0 ? cueNorm * duration : -1
    let raf = 0
    const loop = () => {
      const prev = prevTime.current
      const cur = timeRef.current
      if (prev > cur + 0.5) {
        // 循环回绕：完成 1 次
        setReps((r) => r + 1)
        repBeep()
      } else if (cueSec > 0 && prev < cueSec && cur >= cueSec) {
        // 正向播放穿越发力点
        cueBeep()
      }
      prevTime.current = cur
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase, paused, isTimed, program, duration, cueNorm])

  // 计次类：达到目标次数 → 本组完成
  useEffect(() => {
    if (phase === 'set' && !isTimed && program?.reps && reps >= program.reps) finishSet()
  }, [reps, phase, isTimed, program, finishSet])

  // 组内鼓励（计次类）：过半 + 最后冲刺，各触发一次；冷却门控避免打断播报
  useEffect(() => {
    if (phase !== 'set' || isTimed || !program?.reps) return
    const target = program.reps
    if (!cheeredRef.current.half && reps >= Math.ceil(target / 2) && reps < target) {
      cheeredRef.current.half = true
      if (canCheer(6000)) speak(pickCheer('milestone'))
    }
    if (!cheeredRef.current.last && target - reps <= 2 && reps >= 1 && reps < target) {
      cheeredRef.current.last = true
      if (canCheer(4000)) speak(pickCheer('lastReps'))
    }
  }, [reps, phase, isTimed, program])

  // 组内鼓励（计时类）：过半 + 最后 ~10 秒
  useEffect(() => {
    if (phase !== 'set' || !isTimed || !program?.seconds) return
    const total = program.seconds
    if (!cheeredRef.current.half && secondsLeft <= Math.ceil(total / 2) && secondsLeft > 11) {
      cheeredRef.current.half = true
      if (canCheer(6000)) speak(pickCheer('milestone'))
    }
    if (!cheeredRef.current.last && secondsLeft <= 10 && secondsLeft >= 8) {
      cheeredRef.current.last = true
      if (canCheer(3000)) speak(pickCheer('lastSeconds'))
    }
  }, [secondsLeft, phase, isTimed, program])

  // 休息中段鼓励：提醒回来继续
  useEffect(() => {
    if (phase !== 'rest' || !program?.restSeconds) return
    const rest = program.restSeconds
    if (!cheeredRef.current.rest && secondsLeft <= Math.ceil(rest / 2) && secondsLeft > 4) {
      cheeredRef.current.rest = true
      if (canCheer(5000)) speak(pickCheer('rest'))
    }
  }, [secondsLeft, phase, program])

  // 计时类组内倒计时
  useEffect(() => {
    if (phase !== 'set' || paused || !isTimed) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, paused, isTimed])

  // 组间休息倒计时
  useEffect(() => {
    if (phase !== 'rest' || paused) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, paused])

  // 倒计时归零：tick 提示音 + 阶段流转
  useEffect(() => {
    if (paused) return
    if ((phase === 'set' || phase === 'rest') && secondsLeft > 0 && secondsLeft <= 3) tickBeep()
    if (phase === 'set' && isTimed && secondsLeft <= 0) finishSet()
    if (phase === 'rest' && secondsLeft <= 0) startNextSet()
  }, [secondsLeft, phase, paused, isTimed, finishSet, startNextSet])

  const modelPlaying = phase === 'set' && !paused
  const totalSets = program?.sets ?? 0
  const currentSet = setIndex + 1

  if (!program) {
    return (
      <div className="fa-wrap">
        <aside className="fa-panel">
          <p className="fa-empty">这个动作还没有配置跟练参数，先去动作页学习标准姿势吧。</p>
        </aside>
      </div>
    )
  }

  return (
    <div className="fa-wrap">
      <div className="fa-stage">
        <Stage exercise={exercise} playing={modelPlaying} speed={speed} timeRef={timeRef} onDuration={setDuration} />
        <div className="fa-stage-badge">
          {phase === 'set'
            ? `第 ${currentSet} / ${totalSets} 组 · 跟着节奏做`
            : phase === 'rest'
              ? '组间休息 · 保持活动'
              : phase === 'done'
                ? '训练完成 🎉'
                : '准备开始'}
        </div>
      </div>

      <aside className="fa-panel">
        {phase === 'idle' && (
          <>
            <h2>🏃 跟练 {exercise.name}</h2>
            <div className="fa-overview">
              <div className="fa-stat">
                <span>组数</span>
                <b>{program.sets} 组</b>
              </div>
              <div className="fa-stat">
                <span>{isTimed ? '每组时长' : '每组次数'}</span>
                <b>{isTimed ? `${program.seconds} 秒` : `${program.reps} 次`}</b>
              </div>
              <div className="fa-stat">
                <span>组间休息</span>
                <b>{program.restSeconds} 秒</b>
              </div>
            </div>
            <div className="fa-speed">
              节奏
              {SPEEDS.map((s) => (
                <button key={s} className={`tb-btn ${speed === s ? 'active' : ''}`} onClick={() => setSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
            <ul className="fa-points">
              {exercise.keyPoints.slice(0, 3).map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
            <button className="btn fa-start" onClick={start}>
              ▶ 开始训练
            </button>
          </>
        )}

        {phase === 'set' && (
          <>
            <div className="fa-phase-label">
              第 <b>{currentSet}</b> / {totalSets} 组
            </div>
            {isTimed ? (
              <div className="fa-big">{fmt(secondsLeft)}</div>
            ) : (
              <>
                <div className="fa-big">
                  {reps}
                  <span className="fa-total">/ {program.reps}</span>
                </div>
                <div className="fa-rep-dots">
                  {Array.from({ length: program.reps ?? 0 }, (_, i) => (
                    <span key={i} className={i < reps ? 'done' : ''} />
                  ))}
                </div>
              </>
            )}
            <div className="fa-btns">
              <button className="tb-btn" onClick={() => setPaused((p) => !p)}>
                {paused ? '▶ 继续' : '⏸ 暂停'}
              </button>
              <button className="tb-btn" onClick={finishSet} title="本组已做完，进入休息">
                ✓ 完成本组
              </button>
              <button className="tb-btn" onClick={quit}>
                结束训练
              </button>
            </div>
            <div className="fa-speed">
              节奏
              {SPEEDS.map((s) => (
                <button key={s} className={`tb-btn ${speed === s ? 'active' : ''}`} onClick={() => setSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'rest' && (
          <>
            <div className="fa-phase-label rest">组间休息</div>
            <div className="fa-big">{fmt(secondsLeft)}</div>
            <p className="fa-next">下一组：第 {currentSet + 1} / {totalSets} 组</p>
            <div className="fa-btns">
              <button className="tb-btn" onClick={() => setPaused((p) => !p)}>
                {paused ? '▶ 继续' : '⏸ 暂停'}
              </button>
              <button className="tb-btn primary" onClick={startNextSet}>
                ⏭ 跳过休息
              </button>
              <button className="tb-btn" onClick={quit}>
                结束训练
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="fa-phase-label done">🎉 训练完成</div>
            <p className="fa-done-text">
              {exercise.name} 共 {totalSets} 组{isTimed ? ` × ${program.seconds} 秒` : ` × ${program.reps} 次`}
              ，完成情况已写入训练日志。
            </p>
            <div className="fa-btns">
              <button className="tb-btn primary" onClick={start}>
                ↻ 再来一遍
              </button>
              <button
                className="tb-btn"
                onClick={() => {
                  reportedRef.current = false
                  setPhase('idle')
                  setSetIndex(0)
                  setReps(0)
                }}
              >
                返回概览
              </button>
            </div>
          </>
        )}

        {/* 声音设置：节拍音效与语音播报独立开关，健身房戴耳机时可以只留其一 */}
        <div className="fa-sound">
          <button
            className={`tb-btn ${sfxOn ? 'active' : ''}`}
            onClick={() => {
              setSfxEnabled(!sfxOn)
              setSfxOn(!sfxOn)
            }}
            title="节拍音效：发力点低音、每次完成高音、倒计时提示"
          >
            {sfxOn ? '🔊 音效' : '🔇 音效'}
          </button>
          <button
            className={`tb-btn ${voiceOn ? 'active' : ''}`}
            onClick={() => {
              setVoiceEnabled(!voiceOn)
              setVoiceOn(!voiceOn)
            }}
            title="语音教练：播报组数、次数、休息与完成"
          >
            {voiceOn ? '🗣 语音' : '🤐 语音'}
          </button>
        </div>
      </aside>
    </div>
  )
}
