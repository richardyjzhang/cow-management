/** 角色权限 */

import { mockRoleBoById } from './role-bo'

export interface RoleRow {
  id: string
  roleName: string
  roleNameBo?: string
  permKeys: string
  remark?: string
  remarkBo?: string
}

const mockRolesZh: RoleRow[] = [
  {
    id: 'rl-001',
    roleName: '超级管理员',
    permKeys: 'all',
    remark: '全部菜单与操作',
  },
  {
    id: 'rl-002',
    roleName: '乡镇业务员',
    permKeys: 'base, breeding, trace:read',
    remark: '基础信息与养殖业务',
  },
  {
    id: 'rl-003',
    roleName: '项目管理员',
    permKeys: 'process, stats:read',
    remark: '流程与统计',
  },
  {
    id: 'rl-004',
    roleName: '财务审核',
    permKeys: 'stats:fund, process:audit',
    remark: '资金与审核',
  },
  {
    id: 'rl-005',
    roleName: '系统运维',
    permKeys: 'trace, system:log',
    remark: '溯源与日志',
  },
  {
    id: 'rl-006',
    roleName: '只读',
    permKeys: 'dashboard, base:read',
    remark: '仅查看',
  },
  {
    id: 'rl-007',
    roleName: '村级防疫员',
    permKeys: 'breeding:immunity, breeding:read',
    remark: '防疫录入',
  },
  {
    id: 'rl-008',
    roleName: '采购专员',
    permKeys: 'process:acceptance, process:read',
    remark: '验收与进度',
  },
  {
    id: 'rl-009',
    roleName: '县级督导',
    permKeys: 'stats, process:read',
    remark: '统计与流程只读',
  },
  {
    id: 'rl-010',
    roleName: '数据导出员',
    permKeys: 'stats:report',
    remark: '报表模块',
  },
  {
    id: 'rl-011',
    roleName: '乡镇负责人',
    permKeys: 'base, breeding, process:task',
    remark: '本乡镇业务',
  },
  {
    id: 'rl-012',
    roleName: '良种站对接',
    permKeys: 'breeding:mating, trace:eartag',
    remark: '配种与耳标',
  },
  {
    id: 'rl-013',
    roleName: '保险协办',
    permKeys: 'base:read, stats:read',
    remark: '档案只读',
  },
  {
    id: 'rl-014',
    roleName: '临时账号',
    permKeys: 'dashboard',
    remark: '限期试用',
  },
  {
    id: 'rl-015',
    roleName: '归档只读',
    permKeys: 'system:log',
    remark: '日志与导出',
  },
]

export const mockRoles: RoleRow[] = mockRolesZh.map((r) => ({
  ...r,
  ...mockRoleBoById[r.id],
}))
