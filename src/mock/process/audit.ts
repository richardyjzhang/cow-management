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

const titles = [
  '2026 年第一批良种奶牛补贴',
  '棚圈改造工程量调整',
  '村级防疫员劳务补贴',
  '饲草料基地土地流转',
  '示范户设备购置申请',
  '溯源系统账号开通',
  '项目质保金退还',
  '冻精采购追加批次',
  '粪污设施改造验收',
  '奶牛保险理赔复核',
  '耳标损耗核销',
  '培训差旅报销',
  '第三方检测费用',
  '示范片宣传物料',
  '跨年项目结转',
]

const statuses: AuditStatus[] = [
  '待审核',
  '已通过',
  '待审核',
  '已通过',
  '已驳回',
  '待审核',
  '已通过',
  '待审核',
  '已通过',
  '待审核',
  '已通过',
  '待审核',
  '已通过',
  '待审核',
  '已通过',
]

export const mockAudits: AuditRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `au-${String(i + 1).padStart(3, '0')}`,
  businessType: ['补贴申请', '项目变更', '费用报销', '采购追加', '系统权限'][i % 5]!,
  title: titles[i]!,
  applicant: i % 3 === 0 ? '扎西顿珠' : i % 3 === 1 ? '县项目办' : '乡镇畜牧站',
  applyDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  status: statuses[i]!,
  auditor:
    statuses[i] === '待审核'
      ? undefined
      : i % 2 === 0
        ? '县农业农村局'
        : '县财政局',
  auditDate:
    statuses[i] === '待审核'
      ? undefined
      : `2026-03-${String(((i + 5) % 28) + 1).padStart(2, '0')}`,
  opinion:
    statuses[i] === '已通过'
      ? '同意按方案实施'
      : statuses[i] === '已驳回'
        ? '材料不齐，请补充'
        : undefined,
}))
