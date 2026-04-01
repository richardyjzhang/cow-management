/** 产奶记录 */

export interface MilkRow {
  id: string
  earTag: string
  recordDate: string
  dailyKg: number
  period: string
  remark?: string
}

const periods = ['泌乳高峰期', '泌乳中期', '泌乳后期', '干奶期']

/** 约 60 条、跨多月日期，便于大屏产奶趋势折线/面积图展示 */
export const mockMilks: MilkRow[] = Array.from({ length: 60 }, (_, i) => {
  const month = 1 + Math.floor(i / 20)
  const day = (i % 20) + 1
  const recordDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const tagNum = (i % 15) + 1
  return {
    id: `mk-${String(i + 1).padStart(3, '0')}`,
    earTag: `NML-2026-${String(tagNum).padStart(4, '0')}`,
    recordDate,
    dailyKg: Math.round((13.5 + (i % 12) * 0.55 + (i % 5) * 0.35 + Math.sin(i / 4) * 0.8) * 10) / 10,
    period: periods[i % periods.length]!,
    remark: i % 9 === 0 ? '早晚两次挤奶' : undefined,
  }
})
