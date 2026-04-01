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

export const mockFunds: FundRow[] = [
  {
    id: 'fd-001',
    projectName: '良种奶牛补贴',
    amount: 8000,
    category: '补贴发放',
    happenDate: '2026-03-01',
    voucherNo: 'PZ-2026-031',
    remark: '县级配套',
  },
  {
    id: 'fd-002',
    projectName: '饲草料采购',
    amount: -125000,
    category: '项目支出',
    happenDate: '2026-03-18',
    voucherNo: 'PZ-2026-045',
    remark: '合同首付款',
  },
]
