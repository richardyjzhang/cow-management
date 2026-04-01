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

export const mockTasks: TaskRow[] = [
  {
    id: 'tk-001',
    title: '春季口蹄疫集中免疫',
    type: '防疫',
    assignee: '乡镇兽医站',
    dueDate: '2026-04-15',
    priority: '高',
    status: '进行中',
  },
  {
    id: 'tk-002',
    title: '奶牛补贴资料复核',
    type: '补贴',
    assignee: '县畜牧中心',
    dueDate: '2026-04-30',
    priority: '中',
    status: '待办',
  },
]
