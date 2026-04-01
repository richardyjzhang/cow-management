/** 操作日志 */

export interface LogRow {
  id: string
  operator: string
  module: string
  action: string
  ip: string
  createdAt: string
  detail?: string
}

const modules = [
  '养殖户管理',
  '免疫记录',
  '奶牛档案',
  '区划管理',
  '任务管理',
  '审核管理',
  '资金统计',
  '耳标管理',
  '配种记录',
  '产奶记录',
  '采购验收',
  '用户管理',
  '角色权限',
  '报表导出',
  '登录',
]

const actions = ['新增', '编辑', '删除', '导出', '登录', '审核']

/** 条数多一些，便于大屏底部操作日志轮播不显得重复 */
export const mockLogs: LogRow[] = Array.from({ length: 40 }, (_, i) => ({
  id: `lg-${String(i + 1).padStart(3, '0')}`,
  operator: i % 3 === 0 ? 'admin' : `user${String((i % 8) + 1).padStart(2, '0')}`,
  module: modules[i % modules.length]!,
  action: actions[i % actions.length]!,
  ip: `192.168.${i % 200}.${(i * 3) % 200}`,
  createdAt: `2026-03-${String((i % 28) + 1).padStart(2, '0')} ${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
  detail: i % 4 === 0 ? `操作对象 #${i + 1}` : undefined,
}))
