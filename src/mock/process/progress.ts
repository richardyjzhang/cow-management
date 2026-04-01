/** 项目进度 */

export interface ProgressRow {
  id: string
  projectName: string
  phase: string
  percent: number
  owner: string
  milestone: string
  updateDate: string
  remark?: string
}

const projects = [
  '优质奶牛扩繁示范',
  '饲草料基地配套',
  '村级防疫体系',
  '溯源平台建设二期',
  '粪污资源化试点',
  '示范户棚圈改造',
  '良种补贴发放',
  '冷链冻精仓储',
  '牧道与饮水点',
  '数字化档案升级',
  '防疫物资储备库',
  '培训与推广',
  '第三方监理',
  '审计整改项',
  '跨年结转项目',
]

const phases = ['土建施工', '设备采购', '安装调试', '试运行', '验收', '收尾']

const percents = [100, 92, 85, 78, 68, 60, 52, 45, 35, 28, 20, 15, 88, 72, 40]

export const mockProgresses: ProgressRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `pg-${String(i + 1).padStart(3, '0')}`,
  projectName: projects[i]!,
  phase: phases[i % phases.length]!,
  percent: percents[i]!,
  owner: i % 2 === 0 ? '县项目办' : '乡镇实施组',
  milestone: `里程碑-${i + 1}`,
  updateDate: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  remark: i % 5 === 0 ? '按周更新' : undefined,
}))
