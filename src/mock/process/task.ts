/** 任务管理 */

export type TaskStatus = '待办' | '进行中' | '已完成' | '已取消'

export interface TaskRow {
  id: string
  title: string
  type: string
  assignee: string
  dueDate: string
  priority: string
  status: TaskStatus
  remark?: string
}

const titles = [
  '春季口蹄疫集中免疫',
  '奶牛补贴资料复核',
  '棚圈验收资料整理',
  '饲草料采购合同签订',
  '村级防疫员培训',
  '耳标发放与绑定抽查',
  '项目进度周报',
  '冻精接收与入库',
  '粪污资源化利用检查',
  '示范户现场复核',
  '溯源二维码巡检',
  '资金拨付材料汇总',
  '县级督查迎检准备',
  '牧道维修协调',
  '良种登记信息补录',
]

const types = ['防疫', '补贴', '项目', '采购', '培训', '溯源', '综合']

const statuses: TaskStatus[] = [
  '进行中',
  '待办',
  '已完成',
  '进行中',
  '待办',
  '已完成',
  '进行中',
  '待办',
  '已完成',
  '进行中',
  '待办',
  '已完成',
  '进行中',
  '待办',
  '已取消',
]

export const mockTasks: TaskRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `tk-${String(i + 1).padStart(3, '0')}`,
  title: titles[i]!,
  type: types[i % types.length]!,
  assignee: i % 2 === 0 ? '乡镇兽医站' : '县畜牧中心',
  dueDate: `2026-04-${String((i % 28) + 1).padStart(2, '0')}`,
  priority: ['高', '中', '低'][i % 3]!,
  status: statuses[i]!,
  remark: statuses[i] === '已取消' ? '上级调整计划' : undefined,
}))
