/** 公牛去势 */

export interface CastrationRow {
  id: string
  earTag: string
  farmerName: string
  villageName: string
  castrationDate: string
  method: string
  vetName: string
  remark?: string
}

export const mockCastrations: CastrationRow[] = [
  {
    id: 'cs-001',
    earTag: 'NML-2026-0006',
    farmerName: '扎西顿珠',
    villageName: '土布加村',
    castrationDate: '2026-02-20',
    method: '血去势',
    vetName: '顿珠',
    remark: '术后观察正常',
  },
]
