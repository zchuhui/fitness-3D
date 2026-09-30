/**
 * 鼓励语库：按训练场景分类，随机抽取且避免连续重复。
 * "坚持就是胜利" —— 语音教练的灵魂。
 */

export type CheerCategory =
  | 'start' // 开练点火（追加在"第 1 组，开始"后）
  | 'milestone' // 组内过半
  | 'lastReps' // 还差 2 次
  | 'lastSeconds' // 计时类最后 ~10 秒
  | 'rest' // 休息中段
  | 'setDone' // 一组完成（追加在"第 N 组完成"后）
  | 'allDone' // 整场完成

const POOLS: Record<CheerCategory, string[]> = {
  start: [
    '今天也是变强的一天，冲！',
    '状态拉满，开始！',
    '相信我，练完你会感谢现在的自己。',
    '每一次训练，都是在给未来的自己投资。',
  ],
  milestone: [
    '已经过半了，稳住节奏！',
    '现在最难受，撑过去就赢了！',
    '身体在燃烧，脂肪在哭泣！',
    '肌肉正在觉醒，保持住！',
  ],
  lastReps: [
    '最后两次，全力冲！',
    '胜利就在眼前，别停下！',
    '冲过去，好身材马上就来！',
  ],
  lastSeconds: [
    '最后十秒，绷住！',
    '核心收紧，马上胜利！',
    '再坚持一下，完美的身材就在前方！',
  ],
  rest: [
    '调整呼吸，肌肉正在偷偷生长。',
    '休息是为了更强的下一组。',
    '喝口水，想想练完的好身材。',
    '别完全瘫住，轻轻活动一下肌肉。',
  ],
  setDone: [
    '坚持就是胜利！',
    '漂亮！好身材正在向你招手。',
    '汗水不会骗人，继续！',
    '这组质量很高，保持这个感觉。',
    '完美的身材，就是这样一组一组练出来的。',
    '你又强了一点点，别停！',
  ],
  allDone: [
    '完美的身材又近了一步，太棒了！',
    '今天的你，打败了昨天的你！',
    '坚持就是胜利，你已经做到了！',
    '给自己点个赞，明天继续！',
  ],
}

const lastIndex = new Map<CheerCategory, number>()

/** 随机抽一句，避免与该场景上一句重复 */
export function pickCheer(cat: CheerCategory): string {
  const pool = POOLS[cat]
  let i = Math.floor(Math.random() * pool.length)
  if (pool.length > 1 && i === lastIndex.get(cat)) {
    i = (i + 1) % pool.length
  }
  lastIndex.set(cat, i)
  return pool[i]
}
