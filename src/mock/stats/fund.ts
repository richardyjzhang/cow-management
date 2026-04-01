/** 资金统计流水 */

export interface FundRow {
  id: string
  projectName: string
  amount: number
  category: string
  happenDate: string
  voucherNo: string
  remark?: string
}

const projects = [
  '良种奶牛补贴',
  '饲草料采购',
  '防疫物资',
  '棚圈改造',
  '冻精采购',
  '培训与推广',
  '溯源运维',
  '第三方检测',
  '设备购置',
  '运输与装卸',
  '保险补贴配套',
  '示范户奖励',
  '审计整改',
  '质保金退还',
  '跨年结转',
]

const categories = ['补贴发放', '项目支出', '运维费用', '其他收入', '其他支出']

const amounts = [
  480000, -125000, 36000, -89000, 215000,
  -42000, 18500, -156000, 320000, -28000,
  65000, -73000, 142000, -31000, 58000,
]

export const mockFunds: FundRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `fd-${String(i + 1).padStart(3, '0')}`,
  projectName: projects[i]!,
  amount: amounts[i]!,
  category: categories[i % categories.length]!,
  happenDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  voucherNo: `PZ-2026-${String(30 + i).padStart(3, '0')}`,
  remark: i % 5 === 0 ? '县级配套' : undefined,
}))
