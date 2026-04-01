/** 系统用户 */

export type UserStatus = '启用' | '禁用'

export interface UserRow {
  id: string
  username: string
  realName: string
  roleId: string
  roleName: string
  phone: string
  status: UserStatus
  createdAt: string
}

export const mockUsers: UserRow[] = [
  {
    id: 'us-001',
    username: 'admin',
    realName: '系统管理员',
    roleId: 'rl-001',
    roleName: '超级管理员',
    phone: '13800000000',
    status: '启用',
    createdAt: '2026-01-01',
  },
  {
    id: 'us-002',
    username: 'xumu001',
    realName: '乡镇畜牧员',
    roleId: 'rl-002',
    roleName: '乡镇业务员',
    phone: '13900000001',
    status: '启用',
    createdAt: '2026-02-10',
  },
]
