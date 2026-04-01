/** 耳标管理 */

export type EartagStatus = '在库' | '已绑定' | '作废'

export interface EartagRow {
  id: string
  earTag: string
  cowId: string
  farmerName: string
  status: EartagStatus
  bindDate: string
  remark?: string
}

export const mockEartags: EartagRow[] = [
  {
    id: 'et-001',
    earTag: 'NML-2026-0001',
    cowId: 'cw-001',
    farmerName: '扎西顿珠',
    status: '已绑定',
    bindDate: '2026-01-08',
  },
  {
    id: 'et-002',
    earTag: 'NML-2026-0009',
    cowId: '',
    farmerName: '',
    status: '在库',
    bindDate: '',
    remark: '待发放',
  },
]
