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

const reasons = [
  '品种鉴定为土杂牛，纳入淘汰',
  '农户自愿淘汰',
  '防疫检疫不合格',
  '繁殖性能差',
  '老龄淘汰',
  '伤病无法恢复',
  '项目置换品种',
  '存栏结构优化',
  '与项目要求不符',
  '县级抽查认定',
  '乡镇复核建议',
  '兽医评估淘汰',
  '饲草紧张自愿出栏',
  '分户并栏后调剂',
  '冻精改良后淘汰',
  '示范户指标调整',
]

export const mockEliminates: EliminateRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `el-${String(i + 1).padStart(3, '0')}`,
  earTag: `NML-2026-${String(i + 1).padStart(4, '0')}`,
  farmerName: farmers[i]!,
  villageName: villages[i]!,
  eliminateDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  reason: reasons[i]!,
  handler: i % 2 === 0 ? '县畜牧站' : '乡镇兽医',
  remark: i % 5 === 0 ? '已拍照存档' : undefined,
}))
