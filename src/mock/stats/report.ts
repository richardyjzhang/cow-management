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

const names = [
  '养殖户与奶牛档案汇总',
  '免疫记录明细',
  '配种与产奶汇总',
  '资金流水对账表',
  '项目进度月报',
  '耳标与溯源绑定表',
  '淘汰与去势台账',
  '采购验收清单',
  '审核单据汇总',
  '乡镇任务完成情况',
  '示范户名录',
  '防疫物资出入库',
  '补贴发放明细',
  '粪污设施台账',
  '年度结转报表',
]

const statuses: ReportStatus[] = [
  '已完成',
  '待生成',
  '生成中',
  '已完成',
  '失败',
  '已完成',
  '待生成',
  '已完成',
  '生成中',
  '已完成',
  '待生成',
  '已完成',
  '已完成',
  '待生成',
  '已完成',
]

export const mockReports: ReportRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `rp-${String(i + 1).padStart(3, '0')}`,
  name: names[i]!,
  period: `2026 年${i % 2 === 0 ? '一季度' : '3 月'}`,
  format: i % 5 === 0 ? 'PDF' : 'Excel',
  status: statuses[i]!,
  generatedAt:
    statuses[i] === '已完成' ? `2026-03-${String((i % 28) + 1).padStart(2, '0')} 09:30` : undefined,
  fileSize: statuses[i] === '已完成' ? `${(1 + (i % 5) * 0.4).toFixed(1)} MB` : undefined,
  remark: statuses[i] === '失败' ? '数据源超时' : undefined,
}))
