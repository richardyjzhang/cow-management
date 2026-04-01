import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockUsers, type UserRow } from '@/mock/system/user'

function clone(data: UserRow[]) {
  return JSON.parse(JSON.stringify(data)) as UserRow[]
}

function genId() {
  return `us-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useSystemUserStore = defineStore('systemUser', () => {
  const rows = ref<UserRow[]>(clone(mockUsers))

  function reset() {
    rows.value = clone(mockUsers)
  }

  function countByRoleId(roleId: string) {
    return rows.value.filter((u) => u.roleId === roleId).length
  }

  function add(payload: Omit<UserRow, 'id'>) {
    const row: UserRow = { ...payload, id: genId() }
    rows.value.push(row)
    return row
  }

  function update(id: string, patch: Partial<Omit<UserRow, 'id'>>) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return false
    rows.value[i] = { ...rows.value[i]!, ...patch, id }
    return true
  }

  function syncRoleName(roleId: string, roleName: string) {
    for (const u of rows.value) {
      if (u.roleId === roleId) u.roleName = roleName
    }
  }

  function remove(id: string) {
    const i = rows.value.findIndex((r) => r.id === id)
    if (i < 0) return false
    rows.value.splice(i, 1)
    return true
  }

  return { rows, reset, add, update, remove, countByRoleId, syncRoleName }
})
