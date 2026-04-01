/** 审核管理 */

export type AuditStatus = '待审核' | '已通过' | '已驳回'

export interface AuditRow {
  id: string
  businessType: string
  title: string
  applicant: string
  applyDate: string
  status: AuditStatus
  auditor?: string
  auditDate?: string
  opinion?: string
}

export const mockAudits: AuditRow[] = [
  {
    id: 'au-001',
    businessType: '补贴申请',
    title: '2026 年第一批良种奶牛补贴',
    applicant: '扎西顿珠',
    applyDate: '2026-03-10',
    status: '待审核',
  },
  {
    id: 'au-002',
    businessType: '项目变更',
    title: '棚圈改造工程量调整',
    applicant: '县项目办',
    applyDate: '2026-03-22',
    status: '已通过',
    auditor: '县农业农村局',
    auditDate: '2026-03-25',
    opinion: '同意按变更方案实施',
  },
]
