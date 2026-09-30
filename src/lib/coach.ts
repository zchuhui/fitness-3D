/**
 * TTS 语音教练：浏览器原生 speechSynthesis，零素材、零体积。
 * 训练场景手机放旁边，"听"远比"看"可靠：
 * 阶段切换时播报"第 2 组，12 次，开始 / 休息 60 秒 / 训练完成"。
 */

const VOICE_KEY = 'fitmotion-voice'

function readEnabled(): boolean {
  try {
    return localStorage.getItem(VOICE_KEY) !== '0'
  } catch {
    return true
  }
}

let voiceOn = readEnabled()

export function isVoiceEnabled() {
  return voiceOn
}

export function setVoiceEnabled(v: boolean) {
  voiceOn = v
  try {
    localStorage.setItem(VOICE_KEY, v ? '1' : '0')
    if (!v && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  } catch {
    // 隐私模式存不进就算了，本次会话内仍生效
  }
}

const synth: SpeechSynthesis | null =
  typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null

let picked: SpeechSynthesisVoice | null = null
let pickedDone = false

/** 挑一个中文嗓音；getVoices 在部分浏览器异步加载，没挑到就交给默认语音 */
function pickVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null
  if (pickedDone) return picked
  const voices = synth.getVoices()
  if (!voices.length) return null // 还没加载完，先用 lang 兜底
  picked =
    voices.find((v) => v.lang === 'zh-CN' && /xiaoxiao|yunxi|ting-?ting|mei-?jia/i.test(v.name)) ??
    voices.find((v) => v.lang === 'zh-CN') ??
    voices.find((v) => v.lang?.startsWith('zh')) ??
    null
  pickedDone = true
  return picked
}

if (synth) {
  // Chrome/Safari 的声音列表异步就绪
  synth.addEventListener?.('voiceschanged', () => {
    picked = null
    pickedDone = false
  })
}

let lastSpeakAt = 0

/** 播报一句短语；新播报前取消上一句，避免快速切换时排队堆积 */
export function speak(text: string) {
  if (!voiceOn || !synth) return
  try {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = 'zh-CN'
    u.rate = 1.05
    synth.speak(u)
    lastSpeakAt = Date.now()
  } catch {
    // 极老浏览器 / 语音引擎异常：静默降级为纯音效
  }
}

/**
 * 鼓励语冷却门控：距离上次播报不足 minGap 时跳过，
 * 避免鼓励语打断正式播报、或密集触发刷屏。
 */
export function canCheer(minGapMs = 6000) {
  if (!voiceOn || !synth) return false
  return Date.now() - lastSpeakAt >= minGapMs
}
