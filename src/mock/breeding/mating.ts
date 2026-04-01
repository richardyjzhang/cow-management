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

export const mockMatings: MatingRow[] = [
  {
    id: 'mt-001',
    earTag: 'NML-2026-0001',
    mateDate: '2026-03-01',
    bullNo: '冻精号 XZ-2025-88',
    method: '人工授精',
    expectedCalving: '2026-12-05',
  },
  {
    id: 'mt-002',
    earTag: 'NML-2026-0003',
    mateDate: '2026-03-08',
    bullNo: '冻精号 XZ-2025-91',
    method: '人工授精',
    expectedCalving: '2026-12-12',
  },
]
