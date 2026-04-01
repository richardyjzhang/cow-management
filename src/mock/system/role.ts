/** 角色权限 */

export interface RoleRow {
  id: string
  roleName: string
  permKeys: string
  remark?: string
}

export const mockRoles: RoleRow[] = [
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
]
