/** 配种记录 */

export interface MatingRow {
  id: string
  earTag: string
  mateDate: string
  bullNo: string
  method: string
  expectedCalving: string
  remark?: string
}

export const mockMatings: MatingRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `mt-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
  mateDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  bullNo: `冻精号 XZ-2025-${88 + i}`,
  method: i % 3 === 0 ? '本交' : '人工授精',
  expectedCalving: `2026-12-${String((i % 27) + 1).padStart(2, '0')}`,
  remark: i % 5 === 0 ? '复配一次' : undefined,
}))
