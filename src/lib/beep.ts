/**
 * 极简音频提示：Web Audio oscillator，无需素材文件。
 * 训练场景（手机在旁边）靠听，比盯屏幕可靠得多。
 */

const SFX_KEY = 'fitmotion-sfx'

function readEnabled(): boolean {
  try {
    return localStorage.getItem(SFX_KEY) !== '0'
  } catch {
    return true
  }
}

let sfxOn = readEnabled()

export function isSfxEnabled() {
  return sfxOn
}

export function setSfxEnabled(v: boolean) {
  sfxOn = v
  try {
    localStorage.setItem(SFX_KEY, v ? '1' : '0')
  } catch {
    // 隐私模式存不进就算了，本次会话内仍生效
  }
}

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!sfxOn) return null
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    // 浏览器自动播放策略：在用户手势后恢复
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function beep(freq = 880, ms = 160, volume = 0.12) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(volume, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + ms / 1000)
  osc.connect(gain).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + ms / 1000)
}

/** 倒计时 tick（最后 3 秒） */
export function tickBeep() {
  beep(660, 90, 0.08)
}

/** 一组完成 / 训练完成 */
export function doneBeep() {
  beep(880, 140)
  setTimeout(() => beep(1320, 220), 150)
}

/** 组间休息结束，准备下一组 */
export function readyBeep() {
  beep(520, 120)
  setTimeout(() => beep(780, 180), 140)
}

/** 报数说不出来时的退路：单次完成仍给一声短促高音 */
export function repBeep() {
  beep(990, 100, 0.09)
}
