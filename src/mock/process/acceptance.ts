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

const materials = [
  '冻精颗粒',
  '青贮饲料膜',
  '兽药（消毒剂）',
  '耳标芯片批次',
  '饲草料添加剂',
  '挤奶设备配件',
  '防疫注射器',
  '青贮窖密封胶',
  '牛用舔砖',
  '运输车辆消毒设备',
  '冻精液氮罐',
  '村级防疫资料袋',
  '示范户标识牌',
  '粪污处理菌种',
  '饲草打捆绳',
]

export const mockAcceptances: AcceptanceRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ac-${String(i + 1).padStart(3, '0')}`,
  materialName: materials[i]!,
  spec: `规格-${i + 1}`,
  qty: 10 + i * 5,
  unit: i % 3 === 0 ? '支' : i % 3 === 1 ? '卷' : '件',
  supplier: i % 2 === 0 ? '区畜牧良种中心' : '日喀则农资',
  acceptDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  result: i === 14 ? '让步接收' : '合格',
  inspector: ['洛桑', '尼玛', '顿珠'][i % 3]!,
  remark: i % 4 === 0 ? '抽检合格' : undefined,
}))
