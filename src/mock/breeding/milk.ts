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

export const mockMilks: MilkRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `mk-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
  recordDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  dailyKg: Math.round((14 + (i % 10) * 0.7 + (i % 3) * 0.2) * 10) / 10,
  period: periods[i % periods.length]!,
  remark: i % 7 === 0 ? '早晚两次挤奶' : undefined,
}))
