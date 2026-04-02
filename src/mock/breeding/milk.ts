/** 产奶记录 */

export interface MilkRow {
  id: string
  earTag: string
  recordDate: string
  dailyKg: number
  period: string
  periodBo?: string
  remark?: string
  remarkBo?: string
}

const periods = ['泌乳高峰期', '泌乳中期', '泌乳后期', '干奶期']
const periodsBo = [
  'འོ་མ་འབབས་དུས་སྐབས་མཐོ་ཤོས།',
  'འོ་མ་འབབས་དུས་སྐབས་འབྲིང་།',
  'འོ་མ་འབབས་དུས་སྐབས་ཕྱི་མ།',
  'འོ་མ་སྐམ་དུས།',
]

/** 约 60 条、跨多月日期，便于大屏产奶趋势折线/面积图展示 */
export const mockMilks: MilkRow[] = Array.from({ length: 60 }, (_, i) => {
  const month = 1 + Math.floor(i / 20)
  const day = (i % 20) + 1
  const recordDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const tagNum = (i % 15) + 1
  const seasonal = month === 1 ? -3.5 : month === 2 ? -1.2 : 2.8
  const base = 15 + seasonal + Math.sin(i / 3) * 4.5 + (i % 7) * 0.6
  const jitter = ((i * 17 + 31) % 11 - 5) * 0.4
  const pi = i % periods.length
  return {
    id: `mk-${String(i + 1).padStart(3, '0')}`,
    earTag: `NML-2026-${String(tagNum).padStart(4, '0')}`,
    recordDate,
    dailyKg: Math.round(Math.max(6, Math.min(28, base + jitter)) * 10) / 10,
    period: periods[pi]!,
    periodBo: periodsBo[pi]!,
    remark: i % 9 === 0 ? '早晚两次挤奶' : undefined,
    remarkBo: i % 9 === 0 ? 'སྔ་དགོང་བཞིན་འོ་མ་འབབས།' : undefined,
  }
})
