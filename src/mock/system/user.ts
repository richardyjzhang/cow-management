/** 系统用户 */

import { mockRoleBoById } from './role-bo'

export type UserStatus = '启用' | '禁用'

export interface UserRow {
  id: string
  username: string
  realName: string
  realNameBo?: string
  roleId: string
  roleName: string
  roleNameBo?: string
  phone: string
  status: UserStatus
  createdAt: string
}

const realNames = [
  '系统管理员',
  '乡镇畜牧员',
  '县畜牧中心',
  '项目办专员',
  '财务审核员',
  '数据录入员',
  '防疫主管',
  '溯源运维',
  '采购专员',
  '审计只读',
  '南木林镇联络员',
  '艾玛乡联络员',
  '卡孜乡联络员',
  '多角乡联络员',
  '只读访客',
]

const realNamesBo = [
  'རྒྱུད་ཁོངས་དོ་དམ་པ།',
  'ཤང་གི་འབྲོག་ལས་མི་སྣ།',
  'རྫོང་འབྲོག་ལས་ལྟེ་གནས།',
  'རྣམ་གྲངས་གཞུང་དོན་ཆེད་གཉེར།',
  'མ་དངུལ་ཞིབ་བཤེར་མི་སྣ།',
  'གྲངས་གཞི་ནང་འཇུག་མི་སྣ།',
  'གཏོར་རིམས་འགན་འཁུར་བ།',
  'ཁུངས་སྐྱེད་སྐྱོན་འཕྲོད།',
  'ཉོ་སྒྲུབ་ཆེད་གཉེར།',
  'ཞིབ་བཤེར་ཀློག་ཆོད།',
  'རྣམ་སྒྲིལ་གྲོང་རྡལ་འབྲེལ་གཏུག་མི་སྣ།',
  'ཨའེ་མཱ་ཤང་འབྲེལ་གཏུག་མི་སྣ།',
  'ཁ་ཟི་ཤང་འབྲེལ་གཏུག་མི་སྣ།',
  'དོ་ཅོའོ་ཤང་འབྲེལ་གཏུག་མི་སྣ།',
  'ཀློག་ཆོད་བཅར་ཁམས་པ།',
]

const roleIds = [
  'rl-001',
  'rl-002',
  'rl-002',
  'rl-003',
  'rl-004',
  'rl-002',
  'rl-003',
  'rl-005',
  'rl-004',
  'rl-006',
  'rl-002',
  'rl-002',
  'rl-002',
  'rl-002',
  'rl-006',
]

const roleNames = [
  '超级管理员',
  '乡镇业务员',
  '乡镇业务员',
  '项目管理员',
  '财务审核',
  '乡镇业务员',
  '项目管理员',
  '系统运维',
  '财务审核',
  '审计只读',
  '乡镇业务员',
  '乡镇业务员',
  '乡镇业务员',
  '乡镇业务员',
  '只读',
]

export const mockUsers: UserRow[] = Array.from({ length: 15 }, (_, i) => {
  const rid = roleIds[i]!
  return {
    id: `us-${String(i + 1).padStart(3, '0')}`,
    username: i === 0 ? 'admin' : `user${String(i + 1).padStart(2, '0')}`,
    realName: realNames[i]!,
    realNameBo: realNamesBo[i]!,
    roleId: rid,
    roleName: roleNames[i]!,
    roleNameBo: mockRoleBoById[rid]?.roleNameBo,
    phone: `138${String(10000000 + i * 111111).slice(0, 8)}`,
    status: i === 14 ? '禁用' : '启用',
    createdAt: `2026-0${1 + (i % 3)}-${String((i % 27) + 1).padStart(2, '0')}`,
  }
})
