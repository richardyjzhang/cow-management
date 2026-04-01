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

export const mockLogs: LogRow[] = [
  {
    id: 'lg-001',
    operator: 'admin',
    module: '养殖户管理',
    action: '新增',
    ip: '192.168.1.10',
    createdAt: '2026-03-29 10:12:08',
    detail: '新增养殖户 扎西顿珠',
  },
  {
    id: 'lg-002',
    operator: 'xumu001',
    module: '免疫记录',
    action: '编辑',
    ip: '10.8.0.5',
    createdAt: '2026-03-28 16:40:22',
    detail: '更新耳标 NML-2026-0001 免疫批次',
  },
]
