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

const statuses: EartagStatus[] = [
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '已绑定',
  '在库',
]

const farmers = [
  '扎西顿珠',
  '扎西顿珠',
  '次仁旺姆',
  '洛桑平措',
  '白玛央金',
  '顿珠次仁',
  '格桑拉姆',
  '索朗多吉',
  '尼玛顿珠',
  '央金卓嘎',
  '平措罗布',
  '德吉拉姆',
  '多吉次仁',
  '拉姆玉珍',
  '',
]

export const mockEartags: EartagRow[] = Array.from({ length: 15 }, (_, i) => {
  const bound = statuses[i] === '已绑定'
  return {
    id: `et-${String(i + 1).padStart(3, '0')}`,
    earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
    cowId: bound ? `cw-${String(i + 1).padStart(3, '0')}` : '',
    farmerName: bound ? farmers[i]! : '',
    status: statuses[i]!,
    bindDate: bound ? `2026-01-${String((i % 28) + 1).padStart(2, '0')}` : '',
    remark: !bound ? '待发放' : i === 14 ? '备用批次' : undefined,
  }
})
