/** 土杂牛淘汰 */

export interface EliminateRow {
  id: string
  earTag: string
  farmerName: string
  villageName: string
  eliminateDate: string
  reason: string
  handler: string
  remark?: string
}

export const mockEliminates: EliminateRow[] = [
  {
    id: 'el-001',
    earTag: 'NML-2026-0005',
    farmerName: '格桑次仁',
    villageName: '南木林村',
    eliminateDate: '2026-03-12',
    reason: '品种鉴定为土杂牛，纳入淘汰',
    handler: '县畜牧站',
    remark: '已拍照存档',
  },
  {
    id: 'el-002',
    earTag: 'NML-2026-0008',
    farmerName: '白玛多吉',
    villageName: '白玛村',
    eliminateDate: '2026-03-18',
    reason: '农户自愿淘汰',
    handler: '乡镇兽医',
  },
]
