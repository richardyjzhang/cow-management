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

const villages = [
  '幸福村',
  '团结村',
  '艾玛村',
  '查卡村',
  '卡孜村',
  '多角村',
  '普当村',
  '仁堆村',
  '秋木村',
  '达那村',
  '芒热村',
  '索金村',
  '土布加村',
  '热当村',
  '拉布普村',
]

const farmers = [
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
  '次仁罗布',
  '边巴顿珠',
]

const methods = ['血去势', '非血去势', '橡皮筋法', '手术去势', '合作兽医站集中去势']

export const mockCastrations: CastrationRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `cs-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-BULL-2026-${String(i + 1).padStart(4, '0')}`,
  farmerName: farmers[i]!,
  villageName: villages[i]!,
  castrationDate: `2026-02-${String((i % 26) + 1).padStart(2, '0')}`,
  method: methods[i % methods.length]!,
  vetName: ['顿珠', '洛桑', '尼玛', '白玛', '索朗'][i % 5]!,
  remark: i % 4 === 0 ? '术后观察正常' : undefined,
}))
