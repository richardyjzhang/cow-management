/** 产奶记录 */

export interface MilkRow {
  id: string
  earTag: string
  recordDate: string
  dailyKg: number
  period: string
  remark?: string
}

export const mockMilks: MilkRow[] = [
  {
    id: 'mk-001',
    earTag: 'NML-2026-0001',
    recordDate: '2026-03-28',
    dailyKg: 18.5,
    period: '泌乳高峰期',
  },
  {
    id: 'mk-002',
    earTag: 'NML-2026-0002',
    recordDate: '2026-03-28',
    dailyKg: 16.2,
    period: '泌乳高峰期',
  },
]
