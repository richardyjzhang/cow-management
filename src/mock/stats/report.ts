/** 报表导出任务 */

export type ReportStatus = '待生成' | '生成中' | '已完成' | '失败'

export interface ReportRow {
  id: string
  name: string
  period: string
  format: string
  status: ReportStatus
  generatedAt?: string
  fileSize?: string
  remark?: string
}

export const mockReports: ReportRow[] = [
  {
    id: 'rp-001',
    name: '养殖户与奶牛档案汇总',
    period: '2026 年一季度',
    format: 'Excel',
    status: '已完成',
    generatedAt: '2026-03-29 09:30',
    fileSize: '2.1 MB',
  },
  {
    id: 'rp-002',
    name: '免疫记录明细',
    period: '2026-03',
    format: 'Excel',
    status: '待生成',
  },
]
