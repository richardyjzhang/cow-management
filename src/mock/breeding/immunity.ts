/** 免疫记录 */

export interface ImmunityRow {
  id: string
  earTag: string
  vaccineName: string
  batchNo: string
  injectDate: string
  nextDate: string
  remark?: string
}

export const mockImmunities: ImmunityRow[] = [
  {
    id: 'im-001',
    earTag: 'NML-2026-0001',
    vaccineName: '口蹄疫 O 型',
    batchNo: 'FT-2026-01',
    injectDate: '2026-01-15',
    nextDate: '2026-07-15',
  },
  {
    id: 'im-002',
    earTag: 'NML-2026-0003',
    vaccineName: '布鲁氏菌病',
    batchNo: 'BR-2026-02',
    injectDate: '2026-02-10',
    nextDate: '2027-02-10',
    remark: '孕畜慎注',
  },
]
