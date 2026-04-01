/** 采购验收 */

export interface AcceptanceRow {
  id: string
  materialName: string
  spec: string
  qty: number
  unit: string
  supplier: string
  acceptDate: string
  result: string
  inspector: string
  remark?: string
}

export const mockAcceptances: AcceptanceRow[] = [
  {
    id: 'ac-001',
    materialName: '冻精颗粒',
    spec: '荷斯坦 XZ-2025',
    qty: 200,
    unit: '支',
    supplier: '区畜牧良种中心',
    acceptDate: '2026-03-05',
    result: '合格',
    inspector: '洛桑',
  },
  {
    id: 'ac-002',
    materialName: '青贮饲料膜',
    spec: '宽 12m',
    qty: 30,
    unit: '卷',
    supplier: '日喀则农资',
    acceptDate: '2026-03-20',
    result: '合格',
    inspector: '尼玛',
    remark: '抽检厚度达标',
  },
]
